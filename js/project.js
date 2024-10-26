import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {nextId} from './util';

proj4.defs([
  ['EPSG:2263', '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=ft +to_meter=0.3048006096012192 +no_defs'],
  ['EPSG:6539', '+proj=lcc +lat_1=40.66666666666666 +lat_2=41.03333333333333 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000 +y_0=0 +ellps=GRS80 +units=us-ft +no_defs']
]);

export function project(fromEpsg, toEpsg, coordinate) {
  return proj4(fromEpsg, toEpsg, coordinate);
}

/**
 * @desc Add a new projection to proj4 and return the code
 * @access protected
 * @method
 * @param {string} def The projecion as defined in a prj file
 * @return {string|undefined} The code for the new projection
 */
export function addPrjDef(def) {
  if (def) {
    const code = nextId('shp:');
    proj4.defs(code, def);
    register(proj4);
    return code;
  }
}
