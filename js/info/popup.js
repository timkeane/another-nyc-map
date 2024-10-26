import $ from 'jquery';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import {html as plutoHtml} from '../layer/html/pluto';

const HTML = `<div class="popup-overlay">
  <div class="popup">
    <h2></h2>
    <a class="btn-close corner"></a>
    <div class="popup-content"></div>
  </div>
  <svg>
    <path d="M40 0 L30 10 L20 0"></path>
  </svg>
</div>`;

const env = import.meta.env;
const format = new GeoJSON();

let dragElem, dragHandle, pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

function down(event) {
  event.preventDefault();
  pos3 = event.clientX;
  pos4 = event.clientY;
  $(document).on('mouseup', up);
  $(document).on('mousemove', dragIt);
}

function dragIt(event) {
  event = event || window.event;
  event.preventDefault();
  pos1 = pos3 - event.clientX;
  pos2 = pos4 - event.clientY;
  pos3 = event.clientX;
  pos4 = event.clientY;
  dragElem.css({
    top: `${dragElem.get(0).offsetTop - pos2}px`,
    left: `${dragElem.get(0).offsetLeft - pos1}px`
  });
  tail();
}

function tail() {
  const svg = $(dragElem).find('path');
  const path = svg.attr('d');
  const parts = path.split(' ');
  parts[2] = `L${(parts[2].substring(1) * 1) + pos1}`;
  parts[3] = `${(parts[3] * 1) + pos2}`;
  svg.attr('d', parts.join(' '));
}

function up() {
  $(document).off('mouseup', up);
  $(document).off('mousemove', dragIt);
  // dragHandle.off('mousedown', down);
}

function drag(element) {
  dragElem = element;
  dragHandle = element.find('h2');
  pos1 = 0;
  pos2 = 0;
  pos3 = 0;
  pos4 = 0;
  dragHandle.on('mousedown', down);
}

function getValue(prop, value) {
  if (prop === 'geometry') {
    return format.writeGeometry(value);
  }
  if (typeof value === 'string' && value.indexOf('http') === 0) {
    return `<a href="${value}" target="_blank">${value}</a>`
  }
  return value;
}

function generic(feature) {
  const properties = feature.getProperties();
  const table = $(`<table><tbody></tbody></table>`);
  const tbody = table.find('tbody');
  Object.entries(properties).forEach(entry => {
    const prop = entry[0];
    const value = getValue(prop, entry[1]);
    tbody.append(`<tr class="${prop}"><td class="field">${prop}</td><td class="value">${value}</td></tr>`);
  });
  return $(`<div class="feature-html"></div>`).append(table);
}

function html(feature, html) {
  html = html || generic;
  return html(feature);
}

function embelish(map, coordinate, feature) {
  const address = `${feature.get('Address')}, ${feature.get('Borough')}`;
  fetch(`${env.VITE_GEOCLIENT_URL}${encodeURIComponent(address)}`)
    .then(response => response.json().then(json => {
      Object.entries(json.results[0].response).forEach(entry => feature.set(entry[0], entry[1]));
      createPopup(map, coordinate, 'PLUTO', html(feature, plutoHtml));
    }));
}

function bringToTop(event) {
  $('.popup-overlay').each((i, popup) => {
    $(popup).parent().removeClass('active-popup');
  });
  $(event.delegateTarget).parent().addClass('active-popup');
}

function createPopup(map, coordinate, name, html) {
  const popup = $(HTML);
  const h2 = popup.find('h2').html(name);
  popup.find('.popup-content').html(html);

  const overlay = new Overlay({
    element: popup.get(0),
    autoPan: {animation: {duration: 250}},
    className: 'ol ol-overlay-container ol-selectable'
  });
  map.addOverlay(overlay);
  drag(popup.parent());

  popup.parent().css('z-index', $('.popup-overlay').length);
  popup.on('click', bringToTop);
  overlay.setPosition(coordinate);

  window.overlays = window.overlays || [];
  window.overlays.push(overlay);
  
  popup.find('.btn-close').on('click', () => {
    popup.fadeOut(() => {
      map.removeOverlay(overlay);
      popup.remove();
    });
  });
}

export default function show(event) {
  const map = event.map;
  const coordinate = event.coordinate;
  const hit = map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
    createPopup(map, coordinate, layer.get('name'), html(feature, layer.get('html')));
    return true;
  });
  if (!hit) {
    fetch(`${env.VITE_PLUTO_INTERSECT_URL}${coordinate.join()}`)
      .then(response => response.json().then(json => {
        if (json.features.length > 0) {
          const feature = format.readFeature(json.features[0]);
          embelish(map, coordinate, feature);
        }
      }));
  }
}