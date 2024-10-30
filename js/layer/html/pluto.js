import $ from 'jquery';
import {boroughName, enAlphabet} from '../../util';
import {links, parameterizeLink} from '../../info/links';
import elected from '../../info/elected';
import {replace} from '../../util';

function noNulls(list) {
  const result = [];
  list.forEach(item => {
    if (item) result.push(item);
  })
  return result;
}

function nameForUrl(name, stateOrFedral, chamber) {
  if (stateOrFedral === 'state') {
    let folder = enAlphabet(name.trim().replace(/ /g, '-'));
    if (chamber === 'senate') folder = folder.toLowerCase();
    return folder;
  }
  return enAlphabet(name.toLowerCase());
}

function zoningLinks(s, linkId) {
  const result = [];
  const values = noNulls(s);
  values.forEach(value => {
    const a = parameterizeLink(links.zone[linkId], value, [value.split('-')[0].toLowerCase()]);
    result.push(a);
  });
  return result.join(', ');
}

function getZoning(p) {
  const map = p.ZoneMap;
  const a = parameterizeLink(links.zone.map, `${map}`, [map]);

  const h3 = $('<h3 data-i18n="zoning"></h3>');
  const ul = $(`<ul><li><strong data-i18n="[prepend]map">:</strong> ${a}</li></ul>`);

  const zone = zoningLinks([p.ZoneDist1, p.ZoneDist2, p.ZoneDist3, p.ZoneDist4], 'district');
  ul.append(`<li><strong data-i18n="[prepend]district">:</strong> ${zone}</li>`);

  const overlay = noNulls([p.Overlay1, p.Overlay2]).join(', ');
  ul.append(overlay ? `<li><strong data-i18n="[prepend]overlay">:</strong> ${overlay}</li>` : '');

  const special = noNulls([p.SPDist1, p.SPDist2, p.SPDist3]).join(', ');
  ul.append(special ? `<li><strong data-i18n="[prepend]special">:</strong> ${special}</li>` : '');

  return $('<div></div>').append(h3).append(ul).html();
}

function getOfficial(types, district, ul) {
  let members;
  let jurisdiction;
  types.forEach(type => {
    members = (members || elected.officials)[type];
    jurisdiction = (jurisdiction || elected.jurisdictions)[type];
  });
  
  const member = members[district];
  const css = types.join('-');
  const li = ul.find(`.${css}`);
  const jurisdictionCreated = li.length === 1;
  const memberName = member.name;
  let link;
  if (types.length == 1) {
    link = parameterizeLink(links.political.person[types[0]], memberName, {district});
  } else {
    const name = nameForUrl(member.lastname || memberName, types[0], types[1]);
    link = parameterizeLink(links.political.person[types[0]][types[1]], ` ${memberName}`, {name});
  }
  
  const official = $(link);
  official.attr('data-i18n',`[prepend]${member.title}`);
  if (jurisdictionCreated) {
    li.append('<br>').append(official);
  } else {    
    const more = !isNaN(district) ? ` <span data-i18n="[prepend]district"> ${district}</span>` : '';
    return $(`<li class="${css}"></li>`)
      .append(`<strong><span data-i18n="jurisdiction.${jurisdiction}"></span>${more}</strong><br>`)
      .append(official);
  }
}

function getPolitical(p) {
  const council = p.cityCouncilDistrict * 1;
  const assembly = p.assemblyDistrict * 1;
  const senate = p.stateSenatorialDistrict * 1;
  const congress = p.congressionalDistrict * 1;
  const h3 = $('<h3 data-i18n="elected.officials"></h3>');
  const ul = $('<ul></ul>');
  ul.append(getElectionDistrict(p))
    .append(getOfficial(['city'], council, ul))
    .append(getOfficial(['state', 'assembly'], assembly, ul))
    .append(getOfficial(['state', 'senate'], senate, ul))
    .append(getOfficial(['federal', 'house'], congress, ul))
    .append(getOfficial(['federal', 'senate'], 'senior', ul))
    .append(getOfficial(['federal', 'senate'], 'junior', ul));
  return $('<div></div>').append(h3).append(ul).html();
}

function getOwner(p) {
  return `<div><strong data-i18n="[prepend]owner">:</strong> ${p.OwnerName}</div>`;
}

function getAddress(p) {
    const city = p.uspsPreferredCityName;
    if (city) return `<address>${p.Address}<br>${p.uspsPreferredCityName}, NY ${p.zipCode}</address>`;
    return `${p.Address}, ${boroughName(p.Borough)}`;
}

function getCommunityBoard(p) {
  const boro = boroughName(p.Borough);
  const board = p.communityDistrictNumber * 1;
  const url = replace(links.district.community, {boro: boro.toLowerCase(), board});
  return `<h3><a href="${url}" target="_blank" rel="noopener">${boro} <span data-i18n="community.board"></span> ${board}</a></h3>`;
}

function getElectionDistrict(p) {
  return $(`<li></li>`)
    .append(`<strong data-i18n="[prepend]election.district"> ${p.electionDistrict}</strong><br>`)
    .append(`<a href="${replace(links.political.pollsite, p)}" target="_blank" rel="noopener" data-i18n="election.poll"></a>`);
}

export function bbl(feature) {
  const p = feature.getProperties();
  const bbl = `${p.BBL}`;
  const block = bbl.substring(1, 6);
  const lot = bbl.substring(6);
  return `${boroughName(p.Borough)} Block: ${block} Lot: ${lot}`;
}

export function plutoHtml(feature) {
  const p = feature.getProperties();
  return $('<div class="feature-html"></div>')
    .append(getAddress(p))
    .append(getOwner(p))
    .append(getCommunityBoard(p))
    .append(getPolitical(p))
    .append(getZoning(p));
}

export function plutoTip(feature) {
  const p = feature.getProperties();
  return {html: `${bbl(feature)}<br>${getAddress(p)}`};
}
