import $ from 'jquery'
import CsvPoint from './CsvPoint'
import Point from 'ol/geom/Point'
import {replace} from '../../util';
import {showLocationTemplate} from '../../dialog';

class CsvAddr extends CsvPoint {
  constructor(options) {
    super(options);
    this.geocode = options.geocode;
    this.locationTemplate = options.locationTemplate;
    this.featureCount = undefined;
    this.geocodedCount = 0;
    this.notGeocoded = [];
  }
  readFeatures(source, options) {
    const features = super.readFeatures(source, options);
    this.featureCount = (this.featureCount || 0) + features.length;
    return features;
  }
  setGeocode(feature, geocode) {
    const input = feature.get('_input');
    const source = feature.get('_source');
    feature.set('_geocodeesp', geocode);
    if (geocode.type === 'geocode') {
      console.info('Geocoded:', input, source, 'geocode response:', geocode);
      feature.setGeometry(new Point(geocode.coordinate));
    } else {
      console.warn('Ambiguous location:', input, source, 'geocode response:', geocode);
      feature.dispatchEvent('change', {target: feature});
    }
  }
  createTemplate(address, borough) {
    this.locationTemplate = `\${${address}},\${${borough}}`;
    this.notGeocoded.forEach(feature => {
      this.geocodeFeature(feature);
    });
  }
  setGeometry(feature, source, options) {
    super.setGeometry(feature, source, options);
    const coordinate = feature.getGeometry().getCoordinates();
    this.mustGeocode = isNaN(coordinate[0]) || isNaN(coordinate[1]);
    if (this.mustGeocode) {
      if (!this.locationTemplate) {
        this.notGeocoded.push(feature);
        if (!this.showDialog) {
          this.showDialog = true;
          setTimeout(() => {
            showLocationTemplate(source, this.createTemplate.bind(this));
          }, 1000);
        }
      } else {
        this.geocodeFeature(feature);
      }
    }
  }
  geocodeFeature(feature) {
    let changed = false;
    const source = feature.getProperties();
    const input = replace(this.locationTemplate, source);
    feature.set('_input', input);
    feature.set('_source', source);
    if (input.replace(/\,/g, '').trim() === '') {
      feature.dispatchEvent({type: 'change', target: feature});
      console.error('Invalid location:', input, 'Bad record:', source);
    } else {
      this.geocode.locate(input).then(geocode => {
        this.setGeocode(feature, geocode);
        changed = true;
      }).catch(error => {
        console.error('Geocoding error:', input, source, 'geocode response:', error);
      }).finally(() => {
        if (!changed) {
          feature.dispatchEvent({type: 'change', target: feature});
        }
        this.geocodedCount = this.geocodedCount + 1;
        if (this.geocodedCount === this.featureCount) {
          // this.dispatchEvent({type: 'geocode-complete', target: this})
        }
      });
    }
  }
}

/**
* @desc Constructor options for {@link module:nyc/ol/format/CsvAddr~CsvAddr}
* @public
* @typedef {Object}
* @property {boolean} [autoDetect=false] Attempt to determine standard column names and projection
* @property {module:nyc/geocode~geocode} x The geocode to use for geocoding feature
* @property {string} locationTemplate The location template for generating a location string to pass to the geocode
*/
CsvAddr.Options;

export default CsvAddr;
