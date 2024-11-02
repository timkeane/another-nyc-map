import $ from 'jquery'
import {addPrjDef} from './project';
import Source from 'ol/source/Vector';
import Layer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import CsvAddr from './layer/format/CsvAddr';
import Geocode from './locate/Geocode';
import style from './layer/style/generic';

const env = import.meta.env;

const geocode = new Geocode({
  url: env.VITE_GEOCLIENT_URL,
  appId: env.VITE_GEOCLIENT_ID,
  appKey: env.VITE_GEOCLIENT_KEY
});

let lastShp;

const Storage = {
  canDownload() {
    return 'download' in $('<a></a>').get(0);
  },
  saveCsv(name, csv) {
    const href = `data:application/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const a = $('<a class="file-dwn"><img></a>');
    $('body').append(a);
    a.attr({href: href, download: name}).find('img').trigger('click');
    a.remove();
  },
  saveGeoJson(name, data) {
    const href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    const a = $('<a class="file-dwn"><img></a>');
    $('body').append(a);
    a.attr({href: href, download: name}).find('img').trigger('click');
    a.remove();
  },
  setItem(key, data) {
    if ('localStorage' in window) {
      localStorage.setItem(key, data)
    }
  },
  getItem(key) {
    if ('localStorage' in window) {
      return localStorage.getItem(key)
    }
  },
  removeItem(key) {
    if ('localStorage' in window) {
      localStorage.removeItem(key)
    }
  },
  readTextFile(callback, file) {
    const reader = new FileReader()
    reader.onload = () => {
      callback(reader.result)
    }
    if (!file) {
      const input = $('<input class="file-in" type="file">')
      $('body').append(input)
      input.change(event => {
        input.remove()
        reader.readAsText(event.target.files[0])
      })
      input.trigger('click')
    } else {
      reader.readAsText(file)
    }
  },
  loadGeoJsonFile(map, callback, file) {
    this.readTextFile(geoJson => {
      const layer = this.addToMap(map, geoJson, file.name)
      if (callback) {
        callback(layer)
      }
    }, file)
  },
  loadCsvFile(map, callback, file) {
    this.readTextFile(csv => {
      const layer = this.addToMap(map, csv, file.name)
      if (callback) {
        callback(layer)
      }
    }, file)
  },
  loadShapeFile(map, callback, files) {
    if (!files) {
      const me = this
      const input = $('<input class="file-in" type="file" multiple>')
      $('body').append(input)
      input.change(event => {
        me.getShpDbfPrj(map, event.target.files, callback)
        input.remove()
      })
      input.trigger('click')
    } else {
      this.getShpDbfPrj(map, files, callback)
    }
  },
  getShpDbfPrj(map, files, callback) {
    let shp, dbf, prj;
    Object.values(files).forEach(file => {
      const name = file.name;
      const ext = name.substring(name.length - 4).toLowerCase();
      if (ext === '.shp') {
        shp = file
        lastShp = file
      } else if (ext === '.dbf') {
        dbf = file
      } else if (ext === '.prj') {
        prj = file
      }
    })
    if (shp) {
      this.readPrj(prj, prjDef => {
        this.readShpDbf(map, shp, dbf, prjDef, callback)
      })
    } else if (callback) {
      callback()
    }
  },
  readPrj(prj, callback) {
    if (prj) {
      this.readTextFile(callback, prj)
    } else {
      callback()
    }
  },
  readShpDbf(map, shp, dbf, prjDef, callback) {
    let shpBuffer, dbfBuffer
    const shpReader = new FileReader()
    shpReader.onload = event => {
      shpBuffer = event.target.result
      if (dbfBuffer || !dbf) {
        this.readShp(map, shpBuffer, dbfBuffer, prjDef, callback)
      }
    }
    const dbfReader = new FileReader()
    dbfReader.onload = event => {
      dbfBuffer = event.target.result
      if (shpBuffer) {
        this.readShp(map, shpBuffer, dbfBuffer, prjDef, callback)
      }
    }
    shpReader.readAsArrayBuffer(shp)
    if (dbf) {
      dbfReader.readAsArrayBuffer(dbf)
    }
  },
  readShp(map, shp, dbf, prjDef, callback) {
    const me = this
    const features = []
    shapefile.open(shp, dbf)
      .then(source => {
        source.read()
          .then(function collect(result) {
            if (result.done) {
              const layer = me.addToMap(map, features, lastShp.name, prjDef)
              if (callback) {
                callback(layer)
              }
              return
            } else {
              features.push(result.value)
            }
            return source.read().then(collect)
          })
      }).catch(error => {
        console.error(error);
      });
  },
  addToMap(map, features, fileName, prjDef) {
    const ext = fileName?.substring(fileName.lastIndexOf('.'));
    const options = {
      featureProjection: map.getView().getProjection().getCode(),
      dataProjection: addPrjDef(prjDef),
      geocode
    };
    const format = ext  === '.csv' ? new CsvAddr(options) : new GeoJSON();
    if (ext  === '.shp') {
      features = {type: 'FeatureCollection', features: features};
    }
    const source = new Source({format});
    const layer = new Layer({source, style});
    if (!layer.get('name') && fileName) layer.set('file', fileName);
    source.addFeatures(format.readFeatures(features, options));
    map.addLayer(layer);
    return layer;
  }
}

/**
 * @desc Callback for {@link module:nyc/LocalStorage~LocalStorage#readTextFile}
 * @public
 * @callback module:nyc/LocalStorage~LocalStorage#readTextFileCallback
 * @param {string} fileContents The text contained in the file
 */

/**
 * @desc Callback for {@link module:nyc/LocalStorage~LocalStorage#loadGeoJsonFile}
 * @public
 * @callback module:nyc/LocalStorage~LocalStorage#loadGeoJsonFileCallback
 * @param {ol.layer.Vector|L.Layer} layer The layer created from the GeoJSON file
 */



export default Storage;
