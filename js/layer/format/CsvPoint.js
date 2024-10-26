import Papa from 'papaparse';
import Feature from 'ol/Feature';
import FormatFeature from 'ol/format/Feature';
import {get as getProjection} from 'ol/proj';
import Point from 'ol/geom/Point';

class CsvPoint extends FormatFeature {
  constructor(options) {
    options = options || {};
    super(options);
    this.dataProjection = getProjection(options.dataProjection || 'EPSG:4326');
    this.featureProjection = getProjection(options.featureProjection || 'EPSG:3857');
  }
  readFeature(source, options) {
    const feature = new Feature(source);
    this.setGeometry(feature, source, options);
    return feature;
  }
  setGeometry(feature, source, options) {
    try {
      const x = source[this.x] = parseFloat(source[this.x]);
      const y = source[this.y] = parseFloat(source[this.y]);
      const point = new Point([x,y]).transform(this.dataProjection, this.featureProjection);
      feature.setGeometry(point);
    } catch(error) {
      console.warn('Failed to parse location from source', source, error);
    }
  }
  readFeatures(source, options) {
    const features = [];
    source = this.parseSource(source);
    source.forEach((row) => {
      try {
        features.push(this.readFeature(row, options));
      } catch (error) {
        console.error(error, row);
      }
    })
    return features;
  }
  parseSource(source) {
    if (source instanceof ArrayBuffer) {
      source = new TextDecoder().decode(source);
    }
    if (typeof source === 'string') {
      source = Papa.parse(source, {header: true}).data;
    }
    this.detectCsvFormat(source);
    return source;
  }
  detectCsvFormat(source) {
    if (source[0].longitude) this.x = 'longitude';
    if (source[0].long) this.x = 'long';
    if (source[0].lng) this.x = 'lng';
    if (source[0].Longitude) this.x = 'Longitude';
    if (source[0].Long) this.x = 'Long';
    if (source[0].Lng) this.x = 'Lng';
    if (source[0].LONGITUDE) this.x = 'LONGITUDE';
    if (source[0].LONG) this.x = 'LONG';
    if (source[0].LNG) this.x = 'LNG';
    if (source[0].latitude) this.y = 'latitude';
    if (source[0].lat) this.y = 'lat';
    if (source[0].Latitude) this.y = 'Latitude';
    if (source[0].Lat) this.y = 'Lat';
    if (source[0].LATITUDE) this.y = 'LATITUDE';
    if (source[0].LAT) this.y = 'LAT';
  }
  readProjection(source) {
    return this.dataProjection;
  }
  getType() {
    return 'arraybuffer';
  }
}

export default CsvPoint;
