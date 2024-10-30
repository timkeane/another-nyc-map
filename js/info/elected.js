import {replace} from '../util';
import {links} from '../info/links';

const officials = {};

const jurisdictions = {
  city: 'city',
  state: {
    assembly: 'state.assembly',
    senate: 'state.senate',
  },
  federal: {
    house: 'federal.house',
    senate: 'federal.senate'  
  }
};

function flip(name) {
  const parts = name.split(',');
  return `${parts[1].trim()} ${parts[0].trim()}`
}

fetch(links.political.service.city).then(response => response.json().then(data => {
  const members = {};
  data.rows.forEach(row => {
    const district = row.district;
    members[district] = {
      title: 'title.council',
      name: row.member
    };
  });
  officials.city = members;
}));

fetch(links.political.service.state).then(response => response.json().then(data => {
  const senate = {};
  const assembly = {};
  data.result.items.forEach(row => {
    const district = row.districtCode;
    const name = row.fullName;
    const member = {name};
    if (row.chamber === 'ASSEMBLY') {
      member.title = 'title.assembly',
      assembly[district] = member;
    } else {
      member.title = 'title.senator',
      senate[district] = member;
    }
  });
  officials.state = {assembly};
  officials.state.senate = senate;
}));

fetch(links.political.service.federal).then(response => response.json().then(data => {
  const house = {};
  const senate = {};
  data.objects.forEach(row => {;
    const lastname = row.person.lastname;
    const member = {
      lastname,
      name: `${row.person.firstname} ${lastname}`
    };
    if (row.role_type === 'senator') {
      member.title = `title.${row.senator_rank_label.toLowerCase()}.${row.role_type_label.toLowerCase()}`;
      senate[row.senator_rank] = member;
    } else {
      member.title = `title.${row.role_type_label.toLowerCase()}`;
      house[row.district] = member;
    }
  });
  officials.federal = {house}; 
  officials.federal.senate = senate; 
}));

export default {jurisdictions, officials};
