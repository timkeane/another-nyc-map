import GeoJSON from 'ol/format/GeoJSON';
import highlightLayer from '../layer/highlight';

const env = import.meta.env;
const format = new GeoJSON();
const source = highlightLayer.getSource();

function removeSearchFeatures() {
  const features = source.getFeatures();
  features.forEach(feature => {
    if (feature.get('forSearch')) {
      source.removeFeature(feature);
    }
  });
}

export function removeHighlight(feature) {
  source.removeFeature(feature);
}

function fromBbl(bbl, callback) {
  fetch(`${env.VITE_PLUTO_BBL_URL}${bbl}`)
  .then(response => response.json().then(json => {
    if (json.features.length > 0) {
      const feature = format.readFeature(json.features[0]);
      feature.set('forSearch', true);
      source.addFeature(feature)
      if (callback) callback(feature);
    }
  }));
}

function fromCoordinate(coordinate, callback) {
  fetch(`${env.VITE_PLUTO_INTERSECT_URL}${coordinate.join()}`)
  .then(response => response.json().then(json => {
    if (json.features.length > 0) {
      const feature = format.readFeature(json.features[0]);
      source.addFeature(feature)
      if (callback) callback(feature);
    }
  }));
}

export function highlightByBbl(bbl, callback) {
  removeSearchFeatures();
  fromBbl(bbl, callback);
}

export function highlightByCoordinate(coordinate, callback) {
  removeSearchFeatures();
  fromCoordinate(coordinate, callback);
}
