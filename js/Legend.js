import $ from 'jquery';
import {showLoad} from './dialog';
import {nextId} from './util';
import csvTable from './csv';

const HTML = `<div class="legend">
  <h2 class="dialog-header">
    Layers
    <a class="btn-close corner" href="#" aria-role="button"
      data-i18n="[title]close;[aria-label]close">
    </a>
  </h2>
    <select class="form-control form-select basemap" name="basemap"
      data-i18n="[title]legend.basemap.choose;[aria-label]legend.basemap.choose">
      <option value="basemap" data-i18n="layer.basemap"></option>
    </select>
  <ul></ul>
  <button class="ol-control btn btn-primary load-layer"
    data-i18n="[title]legend.layer.load;[aria-label]legend.layer.load">
  </button>
  <button class="ol-control btn btn-primary legend-opener"
    data-i18n="[title]legend.open;[aria-label]legend.open">
  </button>
</div>`;

class Legend {
  constructor(options) {
    const legend = $(HTML).localize();
    const openBtn = legend.find('button.legend-opener');
    const loadBtn = legend.find('button.load-layer');

    $(options.target).append(legend).append(openBtn);
    $(options.target).append();

    legend.find('.btn-close').on('click', this.close.bind(this));
    openBtn.on('click', this.open.bind(this));
    loadBtn.on('click', this.load.bind(this));

    this.map = options.map;
    this.view = this.map.getView();
    this.legend = legend;
    this.openBtn = openBtn;
    this.basemap = legend.find('select');

    this.setupBasemap(legend, options.map);
    this.setupLayers(options.layers, this.view);
  }
  open() {
    this.legend.fadeIn(() => {
      this.basemap.trigger('focus');
    });
    this.openBtn.fadeOut();
  }
  close() {
    this.legend.fadeOut();
    this.openBtn.fadeIn();
  }
  setupBasemap(legend, map) {
    map.sortedPhotos().forEach(photo => {
      const year = photo.get('name');
      const option = $(`<option value="${year}">${year}</option>`);
      this.basemap.append(option);
    });
    this.basemap.on('change', () => {
      const year = this.basemap.val();
      if (year === 'basemap') {
        map.hidePhoto();
      } else {
        map.showPhoto(year);
      }
    });
  }
  addLayer(layer) {
    if (layer.get('name') !== 'highlight') {
      const layerList = this.legend.find('ul');
      const li = $('<li></li>');
      const checked = layer.getVisible() ? 'checked' : '';
      const id = nextId('legend-layer');
      const check = $(`<input id="${id}" name="${id}" type="checkbox" class="form-check-input layer-check" ${checked}>`);
      const label = $(`<label for="${id}" data-i18n="layer.${layer.get('name')}"></label>`).localize();
      if (label.html() === '') label.html(layer.get('name'));
      if (label.html() === '') label.html(layer.get('file'));
      layerList.append(li.append(check).append(label));
      layer.set('checkbox', check);
      this.editableCsv(layer, li);
      check.on('click', () => layer.setVisible(check.is(':checked')));
    }
  }
  editableCsv(layer, li) {
    const fileName = layer.get('file') || '';
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    if (ext === '.csv') {
      const btn = $('<button class="btn btn-primary edit" aria-label="Edit" title="Edit"></button>')
        .data('layer', layer)
        .data('legend', this)
        .on('click', csvTable);
      li.append(btn);
    }
  }
  setupLayers(layers, view) {
    layers.forEach(layer => this.addLayer(layer));
    view.on('change:resolution', () => {
      const zoom = view.getZoom();
      layers.forEach(layer => {
        if (layer.get('name') !== 'highlight') {
          const disabled = zoom <= layer.getMinZoom() || zoom > layer.getMaxZoom();
          const check = layer.get('checkbox');
          check.prop('disabled', disabled);
          check.parent()[disabled ? 'addClass' : 'removeClass']('disabled');
        }
      });
    });
  }
  load() {
    showLoad(this.map, this);
  }
}

export default Legend;
