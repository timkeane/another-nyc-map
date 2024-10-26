import $ from 'jquery';
import {nextId} from './util';

const HTML = `<div id="dialog" class="modal fade" data-bs-keyboard="false" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
  <div id="modal" class="modal-dialog">
    <div class="modal-content">
      <h2 class="dialog-header">Load Layer</h2>
      <a class="btn-close corner"></a>
      <div class="modal-body">
        <form class="template-form">
          <select class="form-control form-select address" name="address"></select>
          <select class="form-control form-select boro" name="boro"></select>
          <div class="submit">
            <button class="btn btn-primary template">OK</button>
          </div>
        </form>
        <form class="load-form">
          <input class="form-control name" name="name" type="text" placeholder="Enter a layer name...">
          <input id="load-file" class="form-check-input" name="load" type="radio" value="file" checked>
          <label for="load-file">File</label>
          <input id="load-url" class="form-check-input" name="load" type="radio" value="url">
          <label for="load-url">URL</label>
          <input class="form-control file" name="file" type="file" multiple accept=".shp,.dbf,.prj,.json,.geojson,.csv">
          <input class="form-control url" name="url" type="text" placeholder="Enter a URL to a GeoJSON FeatureCollection...">
          <div class="submit">
            <button class="btn btn-primary load">Load Layer</button>
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

loadForm.find('input[type="radio"]').on('click', () => {
  $('input.url, input.file').hide();
  $(`input.${loadForm.get(0).load.value}`).show();
});

$('#dialog .btn-close').on('click', () => dialog.hide());

function loadLayer(event) {
  const form = loadForm.get(0);
  const callback = layer => {
    const name = form.name.value;
    if (name) layer.set('name', form.name.value);
    maplegend.addLayer(layer);
  }
  event.preventDefault();
  if (form.load.value === 'file') {
    basemap.loadFile(form.file.files, callback);
  } else {
    console.warn(form.url.value);
  }
  dialog.hide();
}

function getColumns(event) {
  event.preventDefault();
  const form = templateForm.get(0);
  returnColumns(form.address.value, form.boro.value);
  dialog.hide();
}

export function showLoad(map, legend) {
  basemap = map;
  maplegend = legend;
  returnColumns = null;
  loadForm.show();
  templateForm.hide();
  dialog.show();
  loadForm.one('submit', loadLayer);
}

export function showLocationTemplate(format, source, callback) {
  basemap = null;
  maplegend = null;
  returnColumns = callback;
  templateForm.find('select.address').append('<option value="0">Choose the adddress column...</option>');
  templateForm.find('select.boro').append('<option value="0">Choose the borough or city column...</option>');
  Object.keys(source).forEach(column => {
    templateForm.find('select').append(`<option>${column}</option>`);
  });
  loadForm.hide();
  templateForm.show();
  dialog.show();
  templateForm.one('submit', getColumns);
}
