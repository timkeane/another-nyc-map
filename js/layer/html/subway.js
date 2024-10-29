import $ from 'jquery';

const subwayLineUrl = 'https://new.mta.info/maps/subway-line-maps';

export function subwayLineHtml(feature) {
  const html = $('<div></div>');
  const subways = feature.get('name').split('-');
  appendRouteIcons(html, subways, subwayLineUrl);
  return html;
}

function appendRouteIcons(html, subways, url) {
  subways.forEach(subway => {
    const img = `<img src="img/subway-${subway}.svg" alt="${subway}">`;
    if (url) {
      const a = `<a href="${url}/${subway}-line" target="_blank" rel="noopener">${img}</a>`;
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
  appendRouteIcons(icons, subways, subwayLineUrl);
  return html;
}

export function subwayStationTip(feature) {
  const html = $(`<div>${feature.get('stop_name')}<br></div>`);
  const subways = feature.get('daytime_routes').split(' ');
  appendRouteIcons(html, subways);
  return {html, css: 'subway-station-tip'};
}
