import $ from 'jquery';
import {showLoad} from './Dialog';
import {nextId} from './util';

const HTML = `<div class="legend">
  <h2>Layers</h2>
  <a class="btn-close corner"></a>
  <ul>
    <li>
      <select class="form-control form-select basemap">
        <option value="basemap">Basemap</option>
      </select>
    </li>
  </ul>
  <button class="ol-control btn btn-primary load-layer" aria-label="Load Layer"></button>
  <button class="ol-control btn btn-primary legend-opener" aria-label="Show legend"></button>
</div>`;

class Legend {
  constructor(options) {
    const legend = $(HTML);
    const openBtn = legend.find('button.legend-opener');
    const loadBtn = legend.find('button.load-layer');

    $(options.target).append(legend).append(openBtn);
    $(options.target).append();

    legend.find('.btn-close').on('click', this.close.bind(this));
    openBtn.on('click', this.open.bind(this));
    loadBtn.on('click', this.load.bind(this));

    this.map = options.map;
    this.legend = legend;
    this.openBtn = openBtn;

    this.setupBasemap(legend, options.map);
    this.setupLayers(options.layers, options.map.getView());
  }
  open() {
    this.legend.fadeIn();
    this.openBtn.fadeOut();
  }
  close() {
    this.legend.fadeOut();
    this.openBtn.fadeIn();
  }
  setupBasemap(legend, map) {
    const basemapSelect = legend.find('select');
    map.sortedPhotos().forEach(photo => {
      const year = photo.get('name');
      const option = $(`<option value="${year}">${year}</option>`);
      basemapSelect.append(option);
    });
    basemapSelect.on('change', () => {
      const year = basemapSelect.val();
      if (year === 'basemap') {
        map.hidePhoto();
      } else {
        map.showPhoto(year);
      }
    });
  }
  addLayer(layer) {
    const layerList = this.legend.find('ul');
    const li = $('<li></li>');
    const checked = layer.getVisible() ? 'checked' : '';
    const id = nextId('legend-layer');
    const check = $(`<input id="${id}" type="checkbox" class="form-check-input layer-check" ${checked}>`);
    const label = $(`<label for="${id}">${layer.get('name')}</label>`);
    layerList.append(li.append(check).append(label));
    layer.set('checkbox', check);
    check.on('click', () => layer.setVisible(check.is(':checked')));
  }
  setupLayers(layers, view) {
    layers.forEach(layer => this.addLayer(layer));
    view.on('change:resolution', () => {
      const zoom = view.getZoom();
      layers.forEach(layer => {
        const disabled = zoom <= layer.getMinZoom() || zoom > layer.getMaxZoom();
        const check = layer.get('checkbox');
        check.prop('disabled', disabled);
        check.parent()[disabled ? 'addClass' : 'removeClass']('disabled');
      });
    });
  }
  load() {
    showLoad(this.map, this);
  }
}

export default Legend;