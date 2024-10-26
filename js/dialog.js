import $ from 'jquery';
import {nextId} from './util';

const HTML = `<div id="dialog" class="modal fade" data-bs-keyboard="false" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
  <div id="modal" class="modal-dialog">
    <div class="modal-content">
      <h2>Load Layer</h2>
      <a class="btn-close corner"></a>
      <div class="modal-body">
        <form>
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

let basemap, maplegend;

$('body').append(HTML);

const dialog = new bootstrap.Modal('#dialog');
const form = $('#dialog form');

function loadLayer(event) {
  const frm = form.get(0);
  const callback = layer => {
    layer.set('name', frm.name.value || nextId('layer-'));
    maplegend.addLayer(layer);
  }
  event.preventDefault();
  if (frm.load.value === 'file') {
    basemap.loadFile(frm.file.files, callback);
  } else {
    console.warn(frm.url.value);
  }
  dialog.hide();
}

$('#dialog input[type="radio"]').on('click', () => {
  $('input.url, input.file').hide();
  $(`input.${form.get(0).load.value}`).show();
  
});

export function showLoad(map, legend) {
  basemap = map;
  maplegend = legend;
  dialog.show();
  form.one('submit', loadLayer);
}
