import $ from 'jquery';

const HTML = `<div id="dialog" class="modal fade" data-bs-keyboard="false" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
  <div id="modal" class="modal-dialog">
    <div class="modal-content">
      <h2 class="dialog-header">
        <span class="title"></span>
        <a class="btn-close corner" href="#"
          data-i18n="[title]close;[aria-label]close">
        </a>
      </h2>
      <div class="modal-body">
        <form class="template-form">
          <select class="form-control form-select address" name="address" data-i18n="[title]address.column;[aria-label]address.column"></select>
          <select class="form-control form-select boro" name="boro" data-i18n="[title]city.column;[aria-label]city.column"></select>
          <div class="submit">
            <button class="btn btn-primary template" name="submit">OK</button>
          </div>
        </form>
        <form class="load-form">
          <input class="form-control name" name="name" type="text" data-i18n="[placeholder]placeholder.layer.name" autocomplete="on">
          <input id="load-file" class="form-check-input" name="load" type="radio" value="file" checked>
          <label for="load-file" data-i18n="input.file"></label>
          <input id="load-url" class="form-check-input" name="load" type="radio" value="url">
          <label for="load-url" data-i18n="input.url"></label>
          <input class="form-control file" name="file" type="file" multiple accept=".shp,.dbf,.prj,.json,.geojson,.csv">
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
  $('#dialog input.url, #dialog input.file').hide();
  $(`#dialog input.${loadForm.get(0).load.value}`).show();
});

$('#dialog .btn-close').on('click', hide);

function loadLayer(event) {
  const form = loadForm.get(0);
  event.preventDefault();
  if (form.file?.files.length > 0 || form.url.value.length > 0) {
    const callback = layer => {
      const name = form.name.value;
      console.warn(name);
      
      if (name) layer.set('name', form.name.value);
      maplegend.addLayer(layer);
    }
    if (form.load.value === 'file') {
      basemap.loadFile(form.file.files, callback);
    } else {
      basemap.loadUrl(form.url.value, callback);
    }
    dialog.hide();
  }
}

function getColumns(event) {
  event.preventDefault();
  const form = templateForm.get(0);
  returnColumns(form.address.value, form.boro.value);
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
  templateForm.find('select.address').append('<option value="0" data-i18n="address.column"></option>');
  templateForm.find('select.boro').append('<option value="0" data-i18n="city.column"></option>');
  Object.keys(source).forEach(column => {
    if (column !== 'undefined') templateForm.find('select')
      .append(`<option>${column}</option>`);
  });
  show(templateForm);
}

export function showAlert(message) {
  title.html('&nbsp;');
  $('#dialog .alert-form .message').html(message);
  show(alertForm);
  setTimeout(() => $('#dialog .alert-form button').trigger('focus'), 500);
}
