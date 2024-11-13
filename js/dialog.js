import $ from 'jquery';

const HTML = `<div id="dialog" class="modal fade" data-bs-keyboard="false" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
  <div id="modal" class="modal-dialog">
    <div class="modal-content">
      <h2 class="dialog-header">
        <span class="title"></span>
        <a class="btn-close corner" href="#" aria-role="button"
          data-i18n="[title]close;[aria-label]close">
        </a>
      </h2>
      <div class="modal-body">
        <form class="template-form">
          <select class="form-control form-select" name="address" 
            data-i18n="[title]csv.address;[aria-label]csv.address">
          </select>
          <select class="form-control form-select" name="borough"
            data-i18n="[title]csv.borough;[aria-label]csv.borough">
          </select>
          <select class="form-control form-select" name="city"
            data-i18n="[title]csv.city;[aria-label]csv.city">
          </select>
          <select class="form-control form-select" name="zip"
            data-i18n="[title]csv.zip;[aria-label]csv.zip">
          </select>
          <div class="submit">
            <button class="btn btn-primary template" name="submit">OK</button>
          </div>
        </form>
        <form class="load-form">
          <div>
            <input id="load-csv" class="form-check-input" name="load" type="radio" value="csv" checked>
            <label for="load-csv" data-i18n="input.file.csv"></label>
          </div>
          <div>
            <input id="load-shp" class="form-check-input" name="load" type="radio" value="shp">
            <label for="load-shp" data-i18n="input.file.shp"></label>
          </div>
          <div>
            <input id="load-geo" class="form-check-input" name="load" type="radio" value="geo">
            <label for="load-geo" data-i18n="input.file.geo"></label>
          </div>
          <div>
            <input id="load-url" class="form-check-input" name="load" type="radio" value="url">
            <label for="load-url" data-i18n="input.url.geo"></label>
          </div>
          <input class="form-control name" name="name" type="text" data-i18n="[placeholder]placeholder.layer.name" autocomplete="on">
          <input class="form-control csv shp geo" name="file" type="file" accept=".csv">
          <input class="form-control url" name="url" type="text" data-i18n="[placeholder]placeholder.url" autocomplete="on">
          <div class="submit">
            <button class="btn btn-primary load" data-i18n="load.layer" name="submit"></button>
          </div>
        </form>
        <form class="alert-form">
          <div class="message"></div>
          <div class="submit">
            <button class="btn btn-primary load" name="submit">OK</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>`;

let basemap, maplegend, returnColumns;

$('body').append(HTML);

const dialog = new bootstrap.Modal('#dialog');
const loadForm = $('#dialog form.load-form');
const templateForm = $('#dialog form.template-form');
const alertForm = $('#dialog form.alert-form');
const title = $('#dialog h2 span');

function show(content) {
  alertForm.hide();
  loadForm.hide();
  templateForm.hide();
  title.localize();
  content.localize().show();
  dialog.show();
  setTimeout(() => content.children().first().trigger('focus'), 500);
}

function hide() {
  basemap = null;
  maplegend = null;
  returnColumns = null;
  title.html('');
  $('#dialog input[type="text"], #dialog select').val(null);
  dialog.hide();
}

function close(event) {
  event.preventDefault();
  hide();
}

loadForm.find('input[type="radio"]').on('click', () => {
  const type = loadForm.get(0).load.value;
  const accept = {csv: '.csv', shp: '.shp,.dbf,.prj', geo: '.json,.geojson'};
  $('#dialog input.url, #dialog input[type="file"]').hide();
  $('#dialog input[type="file"]').attr('accept', accept[type])
    .prop('multiple', type === 'shp');
  $(`#dialog input.${type}`).show();
});

$('#dialog .btn-close').on('click', hide);

function loadLayer(event) {
  const form = loadForm.get(0);
  event.preventDefault();
  if (form.file?.files.length > 0 || form.url.value.length > 0) {
    const callback = layer => {
      const name = form.name.value;
      if (name) layer.set('name', form.name.value);
      maplegend.addLayer(layer);
    }
    if (form.load.value === 'url') {
      basemap.loadUrl(form.url.value, callback);
    } else {
      basemap.loadFile(form.file.files, callback);
    }
    dialog.hide();
  }
}

function getColumns(event) {
  const columns = {};
  event.preventDefault();
  templateForm.find('select').each((i, select) => {
    const column = select.value;
    if (column !== '0') {
      columns[select.name] = column;
    }
  });
  returnColumns(columns);
  dialog.hide();
}

alertForm.on('submit', close);
templateForm.on('submit', getColumns);
loadForm.on('submit', loadLayer);

export function showLoad(map, legend) {
  basemap = map;
  maplegend = legend;
  title.attr('data-i18n', 'load.layer');
  show(loadForm);
}

export function showLocationTemplate(source, callback) {
  returnColumns = callback;
  title.attr('data-i18n', 'geocode.csv');
  templateForm.find('select').each((i, select) => {
    $(select).empty()
      .append(`<option value="0" data-i18n="csv.${select.name}"></option>`)
      .append('<option value="0" data-i18n="csv.none"></option>');
    Object.keys(source).forEach(column => {
      if (column !== 'undefined') {
        $(select).append(`<option>${column}</option>`);
      }
    });
  });
  show(templateForm);
}

export function showAlert(message) {
  title.html('&nbsp;');
  $('#dialog .alert-form .message').html(message);
  show(alertForm);
  setTimeout(() => $('#dialog .alert-form button').trigger('focus'), 500);
}
