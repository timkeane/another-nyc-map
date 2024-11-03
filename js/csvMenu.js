import $ from 'jquery';
import Storage from './Storage';
import {nextId} from './util';

const FORM = `<form class="csv-menu">
  <h2></h2>
  <button class="btn btn-primary save"
    data-i18n="[title]csv.save;[aria-label]csv.save">
  </button>
  <button class="btn btn-primary add"
    data-i18n="[title]csv.add;[aria-label]csv.add">
  </button>
  <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle columns" aria-expanded="false"
      data-bs-toggle="dropdown" data-bs-auto-close="outside"
      data-i18n="[title]csv.columns;[aria-label]csv.columns">
    </button>
    <ul class="dropdown-menu">
      <li class="visibility dropend">
        <a class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown"
          href="#" data-i18n="csv.visibility"></a>
      </li>
      <li class="append dropend">
        <a class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown"
          href="#" data-i18n="csv.append"></a>
      </li>
    </ul>
  </div>
  <a class="btn-close corner" href="#" aria-role="button"
    data-i18n="[title]close;[aria-label]close">
  </a>
</form>`;

function save(layer) {
  const source = layer.getSource();
  const format = source.getFormat();
  const csv = format.writeFeatures(source.getFeatures());
  Storage.saveCsv(`geocoded.${layer.get('file')}`, csv);
}

let columnState;
function columnsMenu(table, row, selected) {
  const ul = $('<ul class="dropdown-menu"></ul>');
  columnState = {};
  Object.keys(row).forEach(column => {
    const id = nextId('column');
    const label = $(`<label for="${id}">${column}</label>`);
    const checked = selected && ['longitude', 'latitude'].indexOf(column) === -1 ? 'checked' : '';
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

export function setColumnVisibility(node) {
  Object.entries(columnState).forEach(entry => {
    if (!entry[1]) {
      const selector = `[data-prop="${entry[0]}"]`;
      node.find(`th${selector}, td${selector}`).hide()
    }
  });
}

export function create(parent, layer, feature, addCallback) {
  const form = $(FORM);
  const table = parent.find('table');
  const visibilityUl = columnsMenu(table, feature.getCsvRow(), true);
  const appendUl = columnsMenu(table, feature.get('__geocode').data, false);
  form.find('h2').html(layer.get('file'));
  form.find('.visibility').append(visibilityUl);
  form.find('.append').append(appendUl);
  form.find('a.btn-close').on('click', () => {
    form.fadeOut();
    parent.fadeOut();
  });
  form.find('button.save').on('click', event => {
    event.preventDefault();
    save(layer);
  });
  form.find('button.add').on('click', event => {
    event.preventDefault();
    addCallback(layer, parent.find('tbody'));
  });
  $('body').append(form.localize());
  return form;
}
