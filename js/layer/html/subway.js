import $ from 'jquery';
import{links, parameterizeLink} from '../../info/links';

export function subwayLineHtml(feature) {
  const html = $('<div></div>');
  const subways = feature.get('name').split('-');
  appendRouteIcons(html, subways, 'subwayLine');
  return html;
}

export function sirLineHtml(feature) {
  const html = $('<div></div>');
  appendRouteIcons(html, ['SIR'], 'sirLine');
  return html;
}

function appendRouteIcons(html, subways, linkId) {
  subways.forEach(subway => {
    const img = `<img src="img/subway-${subway}.svg" alt="${subway}">`;
    if (linkId) {
      const id = subway === 'SIR' ? 'sirLine' : linkId;
      const a = parameterizeLink(links.layer[id], img, {subway});
      html.append(a);
    } else {
      html.append(img);
    }
  });
}
export function subwayLineTip(feature) {
  const html = $('<div></div>');
  const subways = feature.get('name').split('-');
  appendRouteIcons(html, subways);
  return {html, css: 'subway-line-tip'};
}

export function sirLineTip(feature) {
  const html = $('<div></div>');
  appendRouteIcons(html, ['SIR']);
  return {html, css: 'subway-line-tip'};
}

function appendAda(html, north, south, notes) {
  if (north && south) html.append('<div><img src="img/accessible.svg" alt="Accessible"></div>');
  else if (north) html.append('<div><img src="img/accessible.svg" alt="Accessible"> Northbound</div>');
  else if (south) html.append('<div><img src="img/accessible.svg" alt="Accessible"> Southbound</div>');
  if (notes) html.append(`<div>${notes}</div>`);
}

export function subwayStationHtml(feature) {
  const p = feature.getProperties();
  const html = $(`<div><div><strong>${p.stop_name}</strong></div></div>`);
  const icons = $('<span></span>');
  const subways = p.daytime_routes.split(' ');
  html.append(icons)
    .append(`<div>${p.north_direction_label}/${p.south_direction_label}</div>`);
  appendAda(html, p.ada_northbound, p.ada_southbound, p.ada_notes);
  appendRouteIcons(icons, subways, 'subwayLine');
  return html;
}

export function subwayStationTip(feature) {
  const html = $(`<div>${feature.get('stop_name')}<br></div>`);
  const subways = feature.get('daytime_routes').split(' ');
  appendRouteIcons(html, subways);
  return {html, css: 'subway-station-tip'};
}
