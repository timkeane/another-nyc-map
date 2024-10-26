import Papa from 'papaparse'
import OlFeature from 'ol/Feature'
import OlFormatFeature from 'ol/format/Feature'
import {get as olProjGet} from 'ol/proj'
import Point from 'ol/geom/Point'

class CsvPoint extends OlFormatFeature {
  constructor(options) {
    super()
    this.dataProjection = olProjGet(options.dataProjection || 'EPSG:4326')
    this.featureProjection = 'EPSG:3857'
  }
  readFeature(source, options) {
    const feature = new OlFeature(source)
    this.setGeometry(feature, source, options)
    return feature
  }
  setGeometry(feature, source, options) {
    try {
      const x = source[this.x] = parseFloat(source[this.x])
      const y = source[this.y] = parseFloat(source[this.y])
      feature.setGeometry(new Point([x, y]))
    } catch(error) {
      console.warn('Failed to parse location from source', source);
    }
  }
  readFeatures(source, options) {
    const features = []
    source = this.parseSource(source)
    source.forEach((row) => {
      try {
        features.push(this.readFeature(row, options))
      } catch (error) {
        console.error(error, row)
      }
    })
    return features
  }
  parseSource(source) {
    if (source instanceof ArrayBuffer) {
      source = new TextDecoder().decode(source)
    }
    if (typeof source === 'string') {
      source = Papa.parse(source, {header: true}).data
    }
    this.detectCsvFormat(source)
    return source
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
    if (source[0].latitude) this.x = 'latitude';
    if (source[0].lat) this.x = 'lat';
    if (source[0].Latitude) this.x = 'Latitude';
    if (source[0].Lat) this.x = 'Lat';
    if (source[0].LATITUDE) this.x = 'LATITUDE';
    if (source[0].LAT) this.x = 'LAT';
  }
  readProjection(source) {
    return this.dataProjection
  }
  getType() {
    return 'arraybuffer'
  }
}

export default CsvPoint
