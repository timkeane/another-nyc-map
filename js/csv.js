import $ from 'jquery';
import createContextMenu from './contextMenu';
import { nextId } from './util';

const HTML = `<div class="csv-table">
  <table>
    <thead><tr></tr><theaad>
    <tbody></tbody>
  </table>
</div>`;

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
  const input = $(event.target);
  const feature = input.data('feature');
  const prop = input.data('prop');
  feature.set(prop, input.val());
  
}

export default function csvTable(event) {
  const layer = $(event.target).data('layer');
  const legend = $(event.target).data('legend');
  const source = layer.getSource();
  const features = source.getFeatures();
  const table = $(HTML);
  const header = table.find('thead tr');
  const tbody = table.find('tbody');
  const props = features[0].getProperties();
  const columns = [];
  Object.keys(props).forEach(prop => {
    if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
      header.append(`<th data-prop="${prop}">${prop}</th>`);
      columns.push(prop);
    }
  });
  legend.close();
  createContextMenu(header, columnsMenu(table, columns));

  features.forEach((feature, i) => {
    const props = feature.getProperties();
    const tr = $('<tr></tr>');
    tbody.append(tr);
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
        const input = $(`<input name="prop${i}" data-prop="${prop}" type="text" value="${props[prop]}" autocomplete="off"></input>`)
          .data('feature', feature)
          .on('focus', () => input.trigger('select'))
          .on('change', updateFeature);
        tr.append($(`<td data-prop="${prop}"></td>`).append(input));
        }
    });
  });
  $('body').append(table);
}
