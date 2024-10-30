import $ from 'jquery';
import {replace} from '../util';

const env = import.meta.env;
const officials = {};
const year = new Date().getFullYear();

const services = {
  city: 'https://nyc-council.carto.com/api/v2/sql?q=SELECT%20coundist%20as%20district,%20council_member%20as%20member%20FROM%20council_districts_post_2024',
  state: `https://legislation.nysenate.gov/api/3/members/${year}?full=true&limit=1000&key=${env.VITE_NY_SENATE_KEY}`,
  federal: `https://www.govtrack.us/api/v2/role?current=true&state=NY`,
};
const memberUrls = {
  city: 'https://council.nyc.gov/district-',
  state: {
    assembly: 'https://nyassembly.gov/mem/',
    senate: 'https://www.nysenate.gov/senators/',
  },
  federal: {
    house: 'https://${0}.house.gov/',
    senate: 'https://${0}.senate.gov/'  
  }
};
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

function replaceSpecial(name) {
  return name.replace(/\./g, '')
  .replace(/\'/g, '')
  .replace(/ /g, '-')
  .replace(/\'/g, '')
  .replace(/á/g, '')
  .replace(/é/g, '')
  .replace(/í/g, '')
  .replace(/é/g, '')
  .replace(/ó/g, '')
  .replace(/ú/g, '')
  .replace(/ü/g, '')
  .replace(/ñ/g, '');

}

function nyUrl(name, chamber) {
  let folder = replaceSpecial(name);
  if (chamber === 'senate') folder = folder.toLowerCase();
  return `${memberUrls.state[chamber]}${folder}`;
}

function usUrl(lastname, chamber) {
  lastname = replaceSpecial(lastname.toLowerCase());
  return replace(memberUrls.federal[chamber], [lastname]);
}

function flip(name) {
  const parts = name.split(',');
  return `${parts[1].trim()} ${parts[0].trim()}`
}

fetch(services.city).then(response => response.json().then(data => {
  const members = {};
  data.rows.forEach(row => {
    const district = row.district;
    members[district] = {
      title: 'title.council',
      name: row.member,
      link: `${memberUrls.city}${district}`
    };
  });
  officials.city = members;
}));

fetch(services.state).then(response => response.json().then(data => {
  const senate = {};
  const assembly = {};
  data.result.items.forEach(row => {
    const district = row.districtCode;
    const name = row.fullName;
    const member = {name};
    if (row.chamber === 'ASSEMBLY') {
      member.title = 'title.assembly',
      member.link = nyUrl(name, 'assembly');
      assembly[district] = member;
    } else {
      member.title = 'title.senator',
      member.link = nyUrl(name, 'senate');
      senate[district] = member;
    }
  });
  officials.state = {assembly};
  officials.state.senate = senate;
}));

fetch(services.federal).then(response => response.json().then(data => {
  const house = {};
  const senate = {};
  data.objects.forEach(row => {;
    const lastname = row.person.lastname;
    const member = {
      name: `${row.person.firstname} ${lastname}`
    };
    if (row.role_type === 'senator') {
      member.title = `title.${row.senator_rank_label.toLowerCase()}.${row.role_type_label.toLowerCase()}`;
      member.link = usUrl(lastname, 'senate');
      senate[row.senator_rank] = member;
    } else {
      member.title = `title.${row.role_type_label.toLowerCase()}`;
      member.link = usUrl(lastname, 'house');
      house[row.district] = member;
    }
  });
  officials.federal = {house}; 
  officials.federal.senate = senate; 
}));

window.officials=officials;
export default {jurisdictions, officials};
