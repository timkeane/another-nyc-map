import $ from 'jquery';
import createMenu from './csvMenu';
import {nextId} from './util';
import Point from 'ol/geom/Point';

const HTML = `<div class="csv-table">
  <table>
    <thead><tr></tr></thead>
    <tbody></tbody>
  </table>
</div>`;

function compare(f0, f1) {
  const status0 = f0.get('status');
  const status1 = f1.get('status');
  if (status0 < status1) {
    return -1;
  } else if (status0 > status1) {
    return 1;
  }
  return 0;
}

function showHideColumn(event) {
  const check = $(event.target);
  const checked = check.is(':checked');
  const table = check.data('csv-table');
  const prop = check.data('csv-column');
  event.preventDefault();
  table.find(`th[data-prop="${prop}"], td[data-prop="${prop}"]`).css('display', checked ? 'table-cell' : 'none');
}

function columnsMenu(table, columns) {
  const ul = $('<ul></ul>');
  columns.forEach(column => {
    const id = nextId('column');
    const label = $(`<label for="${id}">${column}</label>`);
    const check = $(`<input id="${id}" name="${id}" type="checkbox" class="form-check-input" checked>`)
      .data('csv-table', table)
      .data('csv-column', column)
      .on('change', showHideColumn);
    ul.append($(`<li></li>`).append(check).append(label));
  });
  return ul;
}

function updateFeature(event) {
  const target = $(event.target);
  const row = target.parent().parent();
  const feature = target.data('feature');
  
  if (target.hasClass('possible')) {
    const index = target.val() * 1;
    if (index > -1) {
      const geocode = feature.get('_geocode');
      const location = geocode.possible[index];
      console.warn(location);
      
      feature.setGeometry(new Point(location.coordinate));
      // feature.set(templateColumns[0], location.data.);
      // feature.set(templateColumns[1], location.data.);
      }
    const templateColumns = feature.get('template-columns')
    feature.set(templateColumns[0], row.find('input.template-address').val());
    feature.set(templateColumns[1], row.find('input.template-city').val());
    // re-geocode...
  } else {
    console.info('text', target);
  }
}

function appendStatus(tr, feature) {
  const geocode = feature.get('_geocode');
  
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
    
  feature.set('status', status);
  tr.append(td);
}

export default function csvTable(event) {
  const layer = $(event.target).data('layer');
  const template = layer.getSource().getFormat().locationTemplate;
  const templateColumns = template.replace(/[\$\{\} ]/g, '').split(',');
  const legend = $(event.target).data('legend');
  const source = layer.getSource();
  const features = source.getFeatures();
  const table = $(HTML);
  const header = table.find('thead tr');
  const tbody = table.find('tbody');
  const props = features[0].getProperties();
  const columns = [];

  header.append('<th class="status" data-i18n="csv.status"></th>');
  Object.keys(props).forEach(prop => {
    if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
      header.append(`<th data-prop="${prop}">${prop}</th>`);
      columns.push(prop);
    }
  });
  legend.close();
  table.data('features', features);
  createMenu(columnsMenu(table, columns));

  features.sort(compare);
  features.forEach((feature, i) => {
    const props = feature.getProperties();
    const tr = $('<tr></tr>');
    appendStatus(tr, feature);
    tbody.append(tr);
    feature.set('template-columns', templateColumns);
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
        const templateAddress = prop === templateColumns[0] ? 'template-address' : '';
        const templateCity = prop === templateColumns[1] ? 'template-city' : '';
        const input = $(`<input class="${templateAddress} ${templateCity}" name="prop${i}" data-prop="${prop}" type="text" value="${props[prop]}" autocomplete="off"></input>`)
          .data('feature', feature)
          .on('focus', () => input.trigger('select'))
          .on('change', updateFeature);
        tr.append($(`<td data-prop="${prop}"></td>`).append(input));
        }
    });
  });
  $('body').append(table.localize());
}
