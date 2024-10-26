import $ from 'jquery';

const links = {
  zoneMap: 'https://s-media.nyc.gov/agencies/dcp/assets/files/pdf/zoning/zoning-maps/map${0}.pdf',
  zoneDist: 'https://www.nyc.gov/site/planning/zoning/districts-tools/${0}.page',
  spDist: 'https://www.nyc.gov/site/planning/zoning/districts-tools/special-purpose-districts.page'
};

export default function link(id, text, parameters) {
  let link = links[id];
  if (parameters) {
    parameters.forEach((param, i) => {
      const regexp = new RegExp(`\\$\\{${i}\\}`);
      link = link.replace(regexp, param);
    });
  }
  return `<a href="${link}" target="_blank" rel="noopener">${text}</a>`;
}