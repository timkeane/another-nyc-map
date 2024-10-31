import $ from 'jquery';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import {plutoHtml, bbl} from '../layer/html/pluto';
import {embelishWithGeoclient, highlightByCoordinate, removeHighlight} from './pluto';
import Drag from '../Drag';

const HTML = `<div class="popup-overlay">
  <div class="popup">
    <a class="btn-close corner" href="#"
      data-i18n="[title]close;[aria-label]close">
    </a>
    <h2></h2>
    <div class="popup-content"></div>
  </div>
  <svg>
    <path d="M40 0 L30 10 L20 0"></path>
  </svg>
</div>`;

const env = import.meta.env;
const format = new GeoJSON();

const layerFilter = function(layer) {
  return layer.get('name') !== 'highlight';
};

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
  return $(`<div class="feature-html generic"></div>`).append(table);
}

function html(feature, html) {
  html = html || generic;
  return html(feature);
}

function bringToTop(event) {
  $('.popup-overlay').each((i, popup) => {
    $(popup).parent().removeClass('active-popup');
  });
  $(event.delegateTarget).parent().addClass('active-popup');
}

function createPopup(map, coordinate, name, html, highlight) {
  const popup = $(HTML);
  const title = popup.find('h2');
  const css = name.replace(/ /g, '-').replace(/\./g, '-');
  title.attr('data-i18n', `layer.${name}`);
  popup.find('.popup-content').html(html).addClass(css);
  popup.localize();
  if (title.html() === '') title.html(name);

  const overlay = new Overlay({
    element: popup.get(0),
    autoPan: {animation: {duration: 250}},
    className: 'ol ol-overlay-container ol-selectable'
  });
  overlay.highlight = highlight;
  map.addOverlay(overlay);
  new Drag(popup.parent(), title);

  popup.parent().css('z-index', $('.popup-overlay').length);
  popup.on('mousedown', bringToTop);
  overlay.setPosition(coordinate);

  window.overlays = window.overlays || [];
  window.overlays.push(overlay);
  
  popup.find('.btn-close').on('click', () => {
    popup.fadeOut(() => {
      removeHighlight(overlay.highlight);
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
  },  {layerFilter});
  if (!hit) {
    highlightByCoordinate(coordinate, feature => embelishWithGeoclient(feature, embelished => {
      createPopup(map, coordinate, bbl(embelished), html(embelished, plutoHtml), embelished);
    }));
  }
}
