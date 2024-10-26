import $ from 'jquery';
import View from 'ol/View';
import Map from 'ol/Map';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import DragPan from 'ol/interaction/DragPan';
import DragZoom from 'ol/interaction/DragZoom';
import KeyboardPan from 'ol/interaction/KeyboardPan';
import KeyboardZoom from 'ol/interaction/KeyboardZoom';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import Storage from './Storage';
import Layer from 'ol/layer/Tile';
import Source from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import ScaleLine from 'ol/control/ScaleLine';
import createFeatureTips from './info/tip';
import showPopup from './info/popup';

const env = import.meta.env;

class Basemap extends Map {
  constructor(options) {
    options = options || {};
    options.view = new View({
      center: Basemap.CENTER,
      minZoom: 8,
      maxZoom: 21,
      zoom: 8,
      constrainRotation: 1
    });

    if (!options.interactions) {
      options.interactions = [
        new DoubleClickZoom(),
        new DragPan(),
        new PinchZoom(),
        new KeyboardPan(),
        new KeyboardZoom(),
        new MouseWheelZoom(),
        new DragZoom()
      ];
    }

    super(options);

    this.hasPhoto = false;
    this.labels = {};
    this.latestPhoto = 0;
    this.photos = {};

    this.base = new Layer({
      extent: Basemap.UNIVERSE_EXTENT,
      source: new Source({url: Basemap.BASE_URL})
    });

    this.addLayer(this.base);

    Object.entries(Basemap.LABEL_URLS).forEach(([labelType, url]) => {
      this.labels[labelType] = new Layer({
        extent: Basemap.LABEL_EXTENT,
        source: new Source({url}),
        zIndex: 1000,
        visible: labelType === Basemap.LabelType.BASE
      });
      this.addLayer(this.labels[labelType]);
    });

    this.setupPhotos(options);
    this.hookupEvents(this.getTargetElement());
    this.defaultExtent();
    this.setupExtras();
  }
  setupExtras() {
    $('.ol-zoom button').each((i, btn) => {
      $(btn).html(`<div>${$(btn).html()}</div>`);
    });

    const scaleControl = new ScaleLine({
      units: 'us',
      bar: true,
      steps: 4,
      text: true,
      minWidth: 140
    });
    this.addControl(scaleControl);

    $(this.getTargetElement()).append('<img class="north-arrow" alt="North" src="img/north.svg">');
  }
  getBaseLayers() {
    return {
      base: this.base,
      labels: this.labels,
      photos: this.photos
    };
  }
  setupPhotos(options) {
    Object.entries(Basemap.PHOTO_URLS).forEach(([year, url]) => {
      const photo = new Layer({
        extent: Basemap.PHOTO_EXTENT,
        source: new Source({url}),
        visible: false
      });
      if ((year.split('-')[0] * 1) > this.latestPhoto) {
        this.latestPhoto = year;
      }
      photo.set('name', year);
      this.addLayer(photo);
      photo.on('change:visible', this.photoChange.bind(this));
      this.photos[year] = photo;
    });
  }
  photoChange() {
    let isPhoto = false;
    Object.entries(this.photos).some(([year, layer]) => {
      isPhoto = layer.getVisible();
      if (isPhoto) {
        this.showLabels(Basemap.LabelType.PHOTO);
        return true;
      }
    });
    if (!isPhoto) {
      this.showLabels(Basemap.LabelType.BASE);
    }
  }
  showPhoto(year) {
    this.hidePhoto();
    this.hasPhoto = true;
    this.photos[(year || this.latestPhoto) + ''].setVisible(true);
    this.showLabels(Basemap.LabelType.PHOTO);
  }
  hidePhoto() {
    this.hasPhoto = false;
    this.showLabels(Basemap.LabelType.BASE);
    Object.entries(this.photos).forEach(([year, layer]) => {
      layer.setVisible(false);
    });
  }
  showLabels(labelType) {
    this.labels.photo.setVisible(labelType === Basemap.LabelType.BASE);
    this.labels.photo.setVisible(labelType === Basemap.LabelType.PHOTO);
  }
  defaultExtent() {
    this.getView().fit(Basemap.EXTENT, this.getSize());
  }
  hookupEvents(node) {
    createFeatureTips(this);
    this.on('singleclick', showPopup);
    $(node).on('drop', this.loadLayer.bind(this));
    $(node).on('dragover', event => event.preventDefault());
  }
  /**
   * @desc Loads a layer from a file
   * @public
   * @method
   * @param {jQuery.Event} event Event object
   */
  loadLayer(event) {
    const transfer = event.originalEvent.dataTransfer;
    event.preventDefault();
    if (transfer && transfer.files.length) {
      this.loadFile(transfer.files);
    }
  }
  loadFile(files, callback) {
    const ext = files[0].name.split('.').pop().toLowerCase();
    if (ext === 'json' || ext === 'geojson') {
      Storage.loadGeoJsonFile(this, callback, files[0]);
    } else if (ext === 'csv') {
      Storage.loadCsvFile(this, callback, files[0]);
    } else {
      Storage.loadShapeFile(this, callback, files);
    }
  }
  saveGeoJson(source, name) {
    const format = new GeoJSON({
      featureProjection: this.getView().getProjection(),
      dataProjection: 'EPSG:4326'
    });
    Storage.saveGeoJson(name || 'layer.geojson', format.writeFeatures(source.getFeatures()));
  }
  sortedPhotos() {
    const sorted = [];
    Object.keys(this.photos).forEach(photo => {
      sorted.push(this.photos[photo]);
    })
    /* sort descending on the first 4 digits - puts 2001-2 in the proper place */
    return sorted.sort((a, b) => {
      const aName = a.name || a.get('name')
      const bName = b.name || b.get('name')
      return bName.substr(0, 4) - aName.substr(0, 4)
    });
  }
}

/**
 * @private
 * @const
 * @type {ol.Extent}
 */
Basemap.UNIVERSE_EXTENT = [-8453323, 4774561, -7983695, 5165920];

/**
* @desc The bounds of New York City
* @public
* @const
* @type {ol.Extent}
*/
Basemap.EXTENT = [-8266522, 4937867, -8203781, 5000276];

/**
* @desc The center of New York City
* @public
* @const
* @type {ol.Coordinate}
*/
Basemap.CENTER = [-8235252, 4969073];

/**
* @private
* @const
* @type {ol.Extent}
*/
Basemap.LABEL_EXTENT = [-8268000, 4870900, -8005000, 5055500];

/**
* @private
* @const
* @type {ol.Extent}
*/
Basemap.PHOTO_EXTENT = [-8268357, 4937238, -8203099, 5001716];

/* @private
 * @const
 * @type {string}
 */
Basemap.BASE_URL = `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/carto/basemap/{z}/{x}/{-y}.jpg`;

/**
 * @desc The URLs of the New York City aerial imagery map tiles
 * @private
 * @const
 * @type {Object<string, string>}
 */
Basemap.PHOTO_URLS = {
  '1924': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/1924/{z}/{x}/{-y}.png8`,
  '1951': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/1951/{z}/{x}/{-y}.png8`,
  '1996': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/1996/{z}/{x}/{-y}.png8`,
  '2001-2': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2001-2/{z}/{x}/{-y}.png8`,
  '2004': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2004/{z}/{x}/{-y}.png8`,
  '2006': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2006/{z}/{x}/{-y}.png8`,
  '2008': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2008/{z}/{x}/{-y}.png8`,
  '2010': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2010/{z}/{x}/{-y}.png8`,
  '2012': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2012/{z}/{x}/{-y}.png8`,
  '2014': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2014/{z}/{x}/{-y}.png8`,
  '2016': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2016/{z}/{x}/{-y}.png8`,
  '2018': `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/photo/2018/{z}/{x}/{-y}.png8`,
  '2020': 'https://tiles.arcgis.com/tiles/yG5s3afENB5iO9fj/arcgis/rest/services/NYC_Orthos_-_2020/MapServer/tile/{z}/{y}/{x}',
  '2022': 'https://tiles.arcgis.com/tiles/yG5s3afENB5iO9fj/arcgis/rest/services/DO_NOT_USE_NYC_2022_Orthos_WMA/MapServer/tile/{z}/{y}/{x}'
};

/**
 * @desc The URLs of the New York City base map label tiles
 * @private
 * @const
 * @type {Object<string, string>}
 */
Basemap.LABEL_URLS = {
  base: `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/carto/label/{z}/{x}/{-y}.png8`,
  photo: `https://${env.VITE_TILE_HOSTS}/tms/1.0.0/carto/label-lt/{z}/{x}/{-y}.png8`
};

/**
 * @desc Enumerator for label types
 * @public
 * @enum {string}
 */
Basemap.LabelType = {
  /**
   * @desc Label type for base layer
   */
  BASE: 'base',
  /**
   * @desc Label type for photo layer
   */
  PHOTO: 'photo'
};

export default Basemap;
