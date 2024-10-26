import $ from 'jquery';
import {boroughName} from '../../util';
import link from '../../info/links';
import elected from '../../info/elected';

const communityBoardUrl = 'https://www.nyc.gov/site/${board}/index.page';

function noNulls(list) {
  const result = [];
  list.forEach(item => {
    if (item) result.push(item);
  })
  return result;
}

function zoningLinks(s, linkId) {
  const result = [];
  const values = noNulls(s);
  values.forEach(value => {
    const a = link(linkId, value, [value.split('-')[0].toLowerCase()]);
    result.push(a);
  });
  return result.join(', ');
}

function getZoning(p) {
  const map = p.ZoneMap;
  const a = link('zoneMap', `${map}`, [map]);

  const h3 = $('<h3>Zoning</h3>');
  const ul = $(`<ul><li><strong>Map:</strong> ${a}</li></ul>`);

  const zone = zoningLinks([p.ZoneDist1, p.ZoneDist2, p.ZoneDist3, p.ZoneDist4], 'zoneDist');
  ul.append(`<li><strong>District:</strong> ${zone}</li>`);

  const overlay = noNulls([p.Overlay1, p.Overlay2]).join(', ');
  ul.append(overlay ? `<li><strong>Overlay:</strong> ${overlay}</li>` : '');

  const special = noNulls([p.SPDist1, p.SPDist2, p.SPDist3]).join(', ');
  ul.append(special ? `<li><strong>Special:</strong> ${special}</li>` : '');

  return $('<div></div>').append(h3).append(ul).html();
}

function getOfficial(types, district) {
  let members;
  let jurisdiction;
  types.forEach(type => {
    members = (members || elected.officials)[type];
    jurisdiction = (jurisdiction || elected.jurisdictions)[type];
  });
  const member = members[district];
  return $('<li></li>')
  .append(`<strong>${jurisdiction}</strong><br>`)
    .append(`<a href="${member.link}" target="_blank" rel="noopener">${member.title} ${member.name}</a>`);
}

function getOfficials(p) {
  const council = p.cityCouncilDistrict * 1;
  const assembly = p.assemblyDistrict * 1;
  const senate = p.stateSenatorialDistrict * 1;
  const congress = p.congressionalDistrict * 1;
  const h3 = $('<h3>Elected Officials</h3>');
  const ul = $('<ul></ul>')
    .append(getOfficial(['city'], council))
    .append(getOfficial(['state', 'assembly'], assembly))
    .append(getOfficial(['state', 'senate'], senate))
    .append(getOfficial(['federal', 'house'], congress))
    .append(getOfficial(['federal', 'senate'], 'senior'))
    .append(getOfficial(['federal', 'senate'], 'junior'));
  return $('<div></div>').append(h3).append(ul).html();
}

function getBbl(p) {
  return `<h3>${boroughName(p.Borough)} Block: ${p.bblTaxBlock} Lot: ${p.bblTaxLot}</h3>`;
}

function getOwner(p) {
  return `<div><strong>Owner:</strong> ${p.OwnerName}</div>`;
}

function getAddress(p) {
    return `<address>${p.Address}<br>${p.uspsPreferredCityName}, NY ${p.zipCode}</address>`;
}

function getCommunityBoard(p) {
  const boro = boroughName(p.Borough);
  const board = p.communityDistrictNumber * 1;
  const url = communityBoardUrl.replace(/\${board\}/, `${boro.toLowerCase()}cb${board}`);
  return `<div><strong><a href="${url}" target="_blank" rel="noopener">${boro} Community Board ${board}</a></strong></div>`;
}

export function html(feature) {
  const p = feature.getProperties();
  return $('<div class="feature-html"></div>')
    .append(getBbl(p))
    .append(getAddress(p))
    .append(getOwner(p))
    .append(getZoning(p))
    .append(getCommunityBoard(p))
    .append(getOfficials(p));
}
