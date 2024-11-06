import $ from 'jquery';
import Storage from './Storage';
import {nextId} from './util';
import GEOCLIENT from './locate/geoclient';

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

const columnState = {vivible: {}, append: {}};

function save(layer) {
  const source = layer.getSource();
  const format = source.getFormat();
  const csv = format.writeFeatures(source.getFeatures(), columnState);
  Storage.saveCsv(`geocoded.${layer.get('file')}`, csv);
}

function menuCheck(table, column, append) {
  const id = nextId('column');
  const label = $(`<label for="${id}" data-prop="${column}">${column}</label>`);
  const checked = !append && ['longitude', 'latitude'].indexOf(column) === -1 ? true : false;
  const check = $(`<input id="${id}" name="${id}" data-prop="${column}" type="checkbox" class="form-check-input" ${checked ? 'checked' : ''}>`)
    .data('csv-table', table)
    .data('csv-column', column)
    .data('geocode-prop', append)
    .on('change', showHideColumn);
  return {check, label};
}

function columnsMenu(table, columns, append) {
  const ul = $('<ul class="dropdown-menu"></ul>');
  Object.keys(columns).forEach(column => {
    const id = nextId('column');
    const label = $(`<label for="${id}">${column}</label>`);
    const checked = !append && ['longitude', 'latitude'].indexOf(column) === -1 ? true : false;
    const check = menuCheck(table, column, append);
    ul.append($(`<li data-prop="${column}"></li>`).append(check.check).append(check.label));
    columnState.vivible[column] = checked;
    if (append) columnState.append[column] = false;
  });
  return ul;
}

function showHideColumn(event) {
  const check = $(event.target);
  const checked = check.is(':checked');
  const table = check.data('csv-table');
  const prop = check.data('csv-column');
  const geo = check.data('geocode-prop');
  event.preventDefault();
  columnState.vivible[prop] = checked;
  if (geo) {
    const ul = $('.csv-menu .visibility ul');
    columnState.append[prop] = checked;
    if (checked) {
      const newCheck = menuCheck(table, prop);
      const li = $(`<li data-prop="${prop}"></li>`).append(newCheck.check).append(newCheck.label);
      ul.append(li);
    } else {
      ul.find(`li[data-prop="${prop}"]`).remove();
    }
    refreshCallback();
  }
  table.find(`th[data-prop="${prop}"], td[data-prop="${prop}"]`).css('display', checked ? 'table-cell' : 'none');
}

export function getColumnState() {
  return columnState;
}

export function setColumnVisibility(node) {
  Object.entries(columnState.vivible).forEach(entry => {
    if (!entry[1]) {
      const selector = `[data-prop="${entry[0]}"]`;
      node.find(`th${selector}, td${selector}`).hide()
    }
  });
}

let refreshCallback;
export function create(parent, layer, feature, addRowCallback, refreshTableCallback) {
  const form = $(FORM);
  const table = parent.find('table');
  columnState.vivible = {};
  columnState.append = {};
  refreshCallback = refreshTableCallback;
  const visibilityUl = columnsMenu(table, feature.getCsvRow());
  const appendUl = columnsMenu(table, GEOCLIENT, true);
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
    addRowCallback(layer, parent.find('tbody'));
  });
  $('body').append(form.localize());
  return form;
}
