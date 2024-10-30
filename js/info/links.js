import {replace} from '../util';

const env = import.meta.env;
const year = new Date().getFullYear();

export const links = {
  layer: {
    subwayLine: 'https://new.mta.info/maps/subway-line-maps/${subway}-line',
    sirLine: 'https://new.mta.info/agency/staten-island-railway'
  },
  zone: {
    map: 'https://s-media.nyc.gov/agencies/dcp/assets/files/pdf/zoning/zoning-maps/map${0}.pdf',
    district: 'https://www.nyc.gov/site/planning/zoning/districts-tools/${0}.page',
    special: 'https://www.nyc.gov/site/planning/zoning/districts-tools/special-purpose-districts.page'  
  },
  district: {
    community: 'https://www.nyc.gov/site/${boro}cb${board}/index.page'
  },
  political: {
    service: {
      city: 'https://nyc-council.carto.com/api/v2/sql?q=SELECT%20coundist%20as%20district,%20council_member%20as%20member%20FROM%20council_districts_post_2024',
      state: `https://legislation.nysenate.gov/api/3/members/${year}?full=true&limit=1000&key=${env.VITE_NY_SENATE_KEY}`,
      federal: `https://www.govtrack.us/api/v2/role?current=true&state=NY`,
    },
    person: {
      city: 'https://council.nyc.gov/district-${district}',
      state: {
        assembly: 'https://nyassembly.gov/mem/${name}',
        senate: 'https://www.nysenate.gov/senators/${name}',
      },
      federal: {
        house: 'https://${name}.house.gov/',
        senate: 'https://${name}.senate.gov/'  
      }
    },
    pollsite: 'https://findmypollsite.vote.nyc/?hn=${houseNumber}&sn=${streetName1In}&zip=${zipCode}'
  }

};

export function parameterizeLink(link, text, parameters) {
  const url = replace(link, parameters || {});
  return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
}
