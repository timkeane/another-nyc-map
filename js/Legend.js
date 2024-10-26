import $ from 'jquery';

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
  <button class="ol-control btn btn-primary legend-opener" aria-label="Show legend"></button>
</div>`;

class Legend {
  constructor(options) {
    const legend = $(HTML);
    const button = legend.find('button.legend-opener');
    $(options.target).append(legend).append(button);
    $(options.target).append();

    this.legend = legend;
    this.button = button;
    legend.find('.btn-close').on('click', this.close.bind(this));
    button.on('click', this.open.bind(this));

    this.setupBasemap(legend, options.map);
    this.setupLayers(legend, options.layers, options.map.getView());
  }
  open() {
    this.legend.fadeIn();
    this.button.fadeOut();
  }
  close() {
    this.legend.fadeOut();
    this.button.fadeIn();
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
  setupLayers(legend, layers, view) {
    const layerList = legend.find('ul');
    layers.forEach((layer, i) => {
      const li = $('<li></li>');
      const checked = layer.getVisible() ? 'checked' : '';
      const check = $(`<input id="legend-layer-${i}" type="checkbox" class="form-check-input layer-check" ${checked}>`);
      const label = $(`<label for="legend-layer-${i}">${layer.get('name')}</label>`);
      layerList.append(li.append(check).append(label));
      layer.set('checkbox', check);
      check.on('click', () => layer.setVisible(check.is(':checked')));
    });

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
}

export default Legend;