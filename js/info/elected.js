import $ from 'jquery';

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
    house: 'https://${lastname}.house.gov/',
    senate: 'https://${lastname}.senate.gov/'  
  }
};
const jurisdictions = {
  city: 'New York City Council',
  state: {
    assembly: 'New York State Assembly',
    senate: 'New York State Senate',
  },
  federal: {
    house: 'U.S. House of Representatives',
    senate: 'U.S. Senate'  
  }
};

function nyUrl(name, chamber) {
  let folder = name.replace(/\./g, '').replace(/ /g, '-');
  if (chamber === 'senate') folder = folder.toLowerCase()
  return `${memberUrls.state[chamber]}${folder}`;
}

function usUrl(lastname, chamber) {
  return memberUrls.federal[chamber].replace(/\$\{lastname\}/, lastname.toLowerCase());
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
      title: 'Councilmember',
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
      member.title = 'Assemblymember',
      member.link = nyUrl(name, 'assembly');
      assembly[district] = member;
    } else {
      member.title = 'Senator',
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
      member.title = `${row.senator_rank_label} ${row.role_type_label}`;
      member.link = usUrl(lastname, 'senate');
      senate[row.senator_rank] = member;
    } else {
      member.title = row.role_type_label;
      member.link = usUrl(lastname, 'house');
      house[row.district] = member;
    }
  });
  officials.federal = {house}; 
  officials.federal.senate = senate; 
}));

window.officials=officials;
export default {jurisdictions, officials};
