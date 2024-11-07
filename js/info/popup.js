import $, { event } from 'jquery';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import {plutoHtml, bbl} from '../layer/html/pluto';
import {embelishWithGeoclient, highlightByCoordinate, removeHighlight} from './pluto';
import {nextId} from '../util';
import LineString from 'ol/geom/LineString';
import {outerWidth, outerHeight} from 'ol/dom';
import {containsExtent} from 'ol/extent';

const HTML = `<div class="popup-overlay">
  <div class="popup">
    <a class="btn-close corner" href="#" aria-role="button"
      data-i18n="[title]close;[aria-label]close">
    </a>
    <a class="btn-min min corner" href="#" aria-role="button"
      data-i18n="[title]min;[aria-label]min">
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
const instances = {};

function panIntoView(panIntoViewOptions) {
  const map = this.getMap();

  if (!map || !map.getTargetElement() || !this.getPosition()) {
    return;
  }

  const mapRect = this.getRect(map.getTargetElement(), map.getSize());
  const element = this.getElement();
  const overlayRect = this.getRect(element, [
    outerWidth($(element).find('.popup-content').get(0)),
    outerHeight(element),
  ]);

  panIntoViewOptions = panIntoViewOptions || {};

  const myMargin =
    panIntoViewOptions.margin === undefined ? 20 : panIntoViewOptions.margin;
  if (!containsExtent(mapRect, overlayRect)) {
    // the overlay is not completely inside the viewport, so pan the map
    const offsetLeft = overlayRect[0] - mapRect[0];
    const offsetRight = mapRect[2] - overlayRect[2];
    const offsetTop = overlayRect[1] - mapRect[1];
    const offsetBottom = mapRect[3] - overlayRect[3];

    const delta = [0, 0];
    if (offsetLeft < 0) {
      // move map to the left
      delta[0] = offsetLeft - myMargin;
    } else if (offsetRight < 0) {
      // move map to the right
      delta[0] = Math.abs(offsetRight) + myMargin;
    }
    if (offsetTop < 0) {
      // move map up
      delta[1] = offsetTop - myMargin;
    } else if (offsetBottom < 0) {
      // move map down
      delta[1] = Math.abs(offsetBottom) + myMargin;
    }

    if (delta[0] !== 0 || delta[1] !== 0) {
      const center = /** @type {import("./coordinate.js").Coordinate} */ (
        map.getView().getCenterInternal()
      );
      const centerPx = map.getPixelFromCoordinateInternal(center);
      if (!centerPx) {
        return;
      }
      const newCenterPx = [centerPx[0] + delta[0], centerPx[1] + delta[1]];

      const panOptions = panIntoViewOptions.animation || {};
      map.getView().animateInternal({
        center: map.getCoordinateFromPixelInternal(newCenterPx),
        duration: panOptions.duration,
        easing: panOptions.easing,
      });
    }
  }
}

function drag(event) {
  const instanceId = $(event.target).data('instanceId');
  const instance = instances[instanceId];
  if (instance && instance.on) {
    event.preventDefault();
    instance.pos1 = instance.pos3 - event.clientX;
    instance.pos2 = instance.pos4 - event.clientY;
    instance.pos3 = event.clientX;
    instance.pos4 = event.clientY;
    instance.dragElem.css({
      top: `${instance.dragElem.get(0).offsetTop - instance.pos2}px`,
      left: `${instance.dragElem.get(0).offsetLeft - instance.pos1}px`
    });
    tail(instanceId);  
  }
}

function tail(instanceId) {
  const instance = instances[instanceId];
  const dragElem = instance.dragElem;
  const svg = dragElem.find('path');
  if (instance) {
    const map = instance.overlay.getMap();
    const coordinate = instance.overlay.getPosition();
    const position = map.getPixelFromCoordinate(coordinate);
    const box = getBox(dragElem);
    const distance = [];
    Object.keys(box).forEach(corner => {
      const length = new LineString([position, box[corner]]).getLength();
      distance.push({corner, length});
    })
    distance.sort((a, b) => {
      if (a.length < b.length) return -1;
      if (a.length > a.length) return 1;
      return 0;
    });    
    adjustTail(instance, svg, box, position, distance[0].corner);
  }
}

function getBox(dragElem) {
  const popup = dragElem.find('.popup');
  const box = popup.get(0).getBoundingClientRect();
  return {
    ll: [box.left, box.bottom],
    lr: [box.right, box.bottom],
    ur: [box.right, box.top],
    ul: [box.left, box.top]
  }
}

function adjustTail(instance, svg, box, position, cr) {
  const path = svg.attr('d');
  const parts = path.split(' ');
  const w = Math.floor(box.lr[0] - box.ll[0]);
  const h = Math.floor(box.ll[1] - box.ul[1]);
  let start;
  let end;

  if (cr === 'll' && box.ll[1] < position[1]) {
    start = 'M40 0';
    end = 'L20 0';
  }
  if (cr === 'lr' && box.ll[1] < position[1]) {
    start = `M${w - 19} 0`;
    end = `L${w - 39} 0`;
  }

  if (cr === 'll' && box.ll[1] >= position[1]) {
    start = 'M1 -20';
    end = 'L1 -40';
  }
  if (cr === 'lr' && box.ll[1] >= position[1]) {
    start = `M${w - 1} -20`;
    end = `L${w - 1} -40`;
  }

  if (cr === 'ul' && box.ul[1] < position[1]) {
    start = `M1 -${h - 39}`;
    end = `L1 -${h - 19}`;
  }
  if (cr === 'ur' && box.ul[1] < position[1]) {
    start = `M${w - 1} -${h - 39}`;
    end = `L${w - 1} -${h - 19}`;
  }

  if (cr === 'ul' && box.ul[1] >= position[1]) {
    start = `M20 -${h - 2}`;
    end = `L40 -${h - 2}`;
  }
  if (cr === 'ur' && box.ul[1] >= position[1]) {
    start = `M${w - 19} -${h - 2}`;
    end = `L${w - 39} -${h - 2}`;
  }

  const mid = `L${(parts[2].substring(1) * 1) + instance.pos1} ${(parts[3] * 1) + instance.pos2}`;
  svg.attr('d', `${start} ${mid} ${end}`);
}


function up(event) {
  Object.values(instances).forEach(instance => instance.on = false)
}

function down(event) {
  const instanceId = $(event.target).data('instanceId');
  const instance = instances[instanceId];
  event.preventDefault();
  if (instance) {
    instance.on = true;
    instance.pos3 = event.clientX;
    instance.pos4 = event.clientY;
    $(document).one('mouseup', up);
    $(document).on('mousemove', drag);
  }
}

class Drag {
  constructor(overlay) {
    const instanceId = nextId('drag');
    this.overlay = overlay;
    this.dragElem = $(overlay.getElement()).parent().data('instanceId', instanceId);
    this.dragHandle = $(overlay.getElement()).find('h2').data('instanceId', instanceId);
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    instances[instanceId] = this;
    this.dragHandle.on('mousedown', down);
  }
}

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
    if (prop.substring(0, 2) !== '__') {
      const value = getValue(prop, entry[1]);
      tbody.append(`<tr class="${prop.replace(/ /g, '-')}"><td class="field">${prop}</td><td class="value">${value}</td></tr>`);
    }
  });
  const geocode = feature.get('__geocode')?.data;
  if (geocode) {
    Object.entries(geocode).forEach(entry => {
      const prop = entry[0];
      const value = entry[1];
      tbody.append(`<tr class="geo ${prop}"><td class="field">${prop}</td><td class="value">${value}</td></tr>`);
    });
    }
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

  popup.find('.popup').addClass(html.hasClass('pluto') ? 'min' : '');

  title.attr('data-i18n', `layer.${name}`);
  popup.find('.popup-content').html(html);
  popup.localize();
  if (title.html() === '') title.html(name);

  const overlay = new Overlay({
    element: popup.get(0),
    autoPan: {animation: {duration: 250}},
    className: 'ol ol-overlay-container ol-selectable'
  });

  overlay.panIntoView = panIntoView.bind(overlay);

  overlay.highlight = highlight;
  map.addOverlay(overlay);
  new Drag(overlay);

  popup.parent().css('z-index', $('.popup-overlay').length);
  popup.on('mousedown', bringToTop);
  overlay.setPosition(coordinate);

  popup.find('.btn-close').on('click', () => {
    popup.fadeOut(() => {
      removeHighlight(overlay.highlight);
      map.removeOverlay(overlay);
      popup.remove();
    });
  });

  popup.find('.btn-min').on('click', event => {
    const btn = $(event.target);
    const minMax = btn.hasClass('min') ? 'max' : 'min';
    btn.removeClass('min').removeClass('max').addClass(minMax)
      .attr('data-i18n', `[title]${minMax};[aria-label]${minMax}`)
      .localize();
    popup.find('.popup-content')[minMax === 'min' ? 'slideDown' : 'slideUp']();
  });
}

export default function show(event) {
  const map = event.map;
  const coordinate = event.coordinate;
  const hit = map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
    const name = layer.get('name') || layer.get('file') || 'layer';
    createPopup(map, coordinate, name, html(feature, layer.get('html')));
    return true;
  },  {layerFilter});
  if (!hit) {
    highlightByCoordinate(coordinate, feature => embelishWithGeoclient(feature, embelished => {
      createPopup(map, coordinate, bbl(embelished), html(embelished, plutoHtml), embelished);
    }));
  }
}
