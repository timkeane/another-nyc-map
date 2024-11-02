import $ from 'jquery';
import createMenu from './csvMenu';
import {nextId} from './util';
import { Feature } from 'ol';

const HTML = `<div class="csv-table">
  <table>
    <thead><tr></tr></thead>
    <tbody></tbody>
  </table>
</div>`;

function compare(f0, f1) {
  const status0 = f0.get('status');
  const status1 = f1.get('status');
  if (status0 < status1) return -1;
  if (status0 > status1) return 1;
  return 0;
}

let columnState;
function columnsMenu(table, feature) {
  const ul = $('<ul></ul>');
  const row = feature.getCsvRow();
  columnState = {};
  Object.keys(row).forEach(column => {
    const id = nextId('column');
    const label = $(`<label for="${id}">${column}</label>`);
    const checked = ['longitude', 'latitude'].indexOf(column) === -1 ? 'checked' : '';
    const check = $(`<input id="${id}" name="${id}" type="checkbox" class="form-check-input" ${checked}>`)
      .data('csv-table', table)
      .data('csv-column', column)
      .on('change', showHideColumn);
    ul.append($(`<li></li>`).append(check).append(label));
    columnState[column] = checked;
  });
  return ul;
}

function showHideColumn(event) {
  const check = $(event.target);
  const checked = check.is(':checked');
  const table = check.data('csv-table');
  const prop = check.data('csv-column');
  event.preventDefault();
  columnState[prop] = checked;
  table.find(`th[data-prop="${prop}"], td[data-prop="${prop}"]`).css('display', checked ? 'table-cell' : 'none');
}

function newFeature(layer, tbody) {
  const source = layer.getSource();
  const existing = source.getFeatures()[3];
  const row = existing.getCsvRow(); // find a good one?
  const format = source.getFormat();

  Object.keys(row).forEach(prop => {
    row[prop] = ''
  });

  const feature = format.readFeature(row);

  feature.set('__view', existing.get('__view'));
  feature.set('__source', source);
  feature.set('__format', format);
  source.addFeature(feature);
  tbody.prepend(featureRow(feature));
  tbody.parent().parent().scrollTop(0);
}

function updateFeature(event) {
  const target = $(event.target);
  const feature = target.data('feature');
  const format = feature.get('__format');
  const templateColumns = feature.get('__templateColumns');
  if (target.hasClass('possible')) {
    const index = target.val() * 1;
    if (index > -1) {
      const geocode = feature.get('__geocode');
      const location = geocode.possible[index];
      format.setGeocode(feature, location);
      featureRow(feature);
    }
  } else {
    const prop = target.attr('data-prop');
    feature.set(prop, target.val());
    const newFeature = format.readFeature(feature.getProperties());
    Object.keys(newFeature.getProperties()).forEach(prop => {
      feature.set(prop, newFeature.get(prop));
    });
    format.geocodeFeature(feature);
    feature.once('geocode', () => {
      featureRow(feature);
    });
    feature.once('ambiguous', () => {
      featureRow(feature);
    });
  }
}

function appendStatus(tr, feature) {
  const geocode = feature.get('__geocode');
  const status = geocode?.type || 'error';
  const td = $(`<td data-prop="status" class="status ${status}">${status}</td>`)
    .data('feature', feature);
  if (status === 'ambiguous') {
    const select = $(`<select class="possible"><option value="-1">${status}</option></select>`)
      .data('feature', feature);
    geocode.possible.forEach((geo, i) => {
      select.append(`<option value="${i}">${geo.name}</option>`);
    });
    td.empty().append(select.on('change', updateFeature));
  }
  feature.set('__status', status);
  tr.append(td);
}

function headerRow(header, feature) {
  const row = feature.getCsvRow();
  header.append('<th class="delete">&nbsp</th><th class="map">&nbsp</th><th class="status" data-i18n="csv.status"></th>');
  Object.keys(row).forEach(prop => {
      header.append(`<th data-prop="${prop}">${prop}</th>`);
  });
}

function startRow(feature) {
  const tr = feature.get('__htmlRow') || $('<tr></tr>');
  const view = feature.get('__view');
  const delBtn = $('<a href="#" class="delete-btn" aria-role="button" data-i18n="[title]csv.delete;[aria-label]csv.delete"></a>');
  const delCell = $('<td class="delete"></td>').append(delBtn);
  const mapBtn = $('<a href="#" class="map-btn" aria-role="button" data-i18n="[title]csv.map;[aria-label]csv.map"></a>');
  const mapCell = $('<td class="map"></td>').append(mapBtn);

  delBtn.on('click', () => {
    tr.remove();
    feature.get('__source').removeFeature(feature);
  });
  mapBtn.on('click', () => {
    const center = feature.getGeometry()?.getCoordinates();
    if (!isNaN(center[0]) && !isNaN(center[1]))
      view.animate({center, zoom: 17});
  });

  return tr.empty().append(delCell).append(mapCell);
}

function featureRow(feature) {
  const name = nextId('prop');
  const format = feature.get('__format');
  const templateColumns = format.templateColumns;
  const row = feature.getCsvRow();
  const tr = startRow(feature);
  feature.set('__htmlRow', tr);
  appendStatus(tr, feature);
  feature.set('__templateColumns', templateColumns);
  Object.keys(row).forEach(prop => {
    const templateAddress = prop === templateColumns[0] ? 'template-address' : '';
    const templateCity = prop === templateColumns[1] ? 'template-city' : '';
    const input = $(`<input class="${templateAddress} ${templateCity}" name="${name}" data-prop="${prop}" type="text" value="${row[prop] || ''}" autocomplete="off"></input>`)
      .data('feature', feature)
      .on('focus', () => input.trigger('select'))
      .on('change', updateFeature);
    tr.append($(`<td data-prop="${prop}"></td>`).append(input));
  });
  setColumnVisibility(tr);
  return tr;
}

function setColumnVisibility(node) {
  Object.entries(columnState).forEach(entry => {
    if (!entry[1]) {
      const selector = `[data-prop="${entry[0]}"]`;
      node.find(`th${selector}, td${selector}`).hide()
    }
  });
}

export default function csvTable(event) {
  const target = $(event.target);
  const view = target.data('legend').view;
  const layer = $(event.target).data('layer');
  const source = layer.getSource();
  const legend = $(event.target).data('legend');
  const features = source.getFeatures();
  const html = $(HTML);
  const table = html.find('table');
  const header = table.find('thead tr');
  const tbody = table.find('tbody');
  const close = html.find('a.btn-close');

  legend.close();
  
  const form = createMenu(layer, html, columnsMenu(table, features[0]), newFeature);

  headerRow(header, features[0]);

  features.sort(compare);
  features.forEach(feature => {
    feature.set('__source', source);
    feature.set('__view', view);
    tbody.append(featureRow(feature));
  });

  setColumnVisibility(table);

  tbody.find('input[data-prop="longitude"], input[data-prop="latitude"]').prop('readonly', true);
  $('body').append(html.localize());
}
