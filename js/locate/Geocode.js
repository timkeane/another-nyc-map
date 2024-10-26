import $ from 'jquery';
import Locate from './Locate';
import {BORO} from '../util';
import ZIP from './Zip';
import {project} from '../project';

function capitalize(s) {
  const words = s.split(' ');
  let result = '';
  words.forEach(w => {
    const word = w.toLowerCase();
    result += word.substring(0, 1).toUpperCase();
    result += word.substring(1).toLowerCase();
    result += ' ';
  })
  return result.trim();
}

class Geocode extends Locate {
  constructor(options) {
    super(options);
    this.url = options.url;
  }
  locate(input) {
    this.lastInput = input;
    return new Promise((resolve, reject) => {
      if (input?.length === 5 && !isNaN(input)) {
        this.geocodeZip(input, resolve, reject);
      }
      const searchInput = encodeURIComponent(input.replace(/"/g, '').replace(/'/g, '').replace(/&/g, ' and '));
      this.callGeoclient(searchInput, resolve, reject);
    });
  }
  geocodeZip(zip) {
    const coordinate = ZIP[zip];
    if (this.isMappable(coordinate)) {
      resolve({
        coordinate,
        accuracy: Locate.Accuracy.ZIP_CODE,
        type: 'geocode',
        name: input
      });
    } else {
      reject({message: `Unkown ZIP Code ${input}`});
    }
  }
  callGeoclient(searchInput, resolve, reject) {
    fetch(`${this.url}${searchInput}`).then(httpResponse => {
      if (httpResponse.status === 200) {
        httpResponse.json().then(geoclientResponse => {
          const result = this.handleResponse(geoclientResponse);
          if (result.error) {
            reject(result);
          } else {
            resolve(result);
          }
        })
      } else {
        const error = httpResponse.error;
        error.status = httpResponse.status;
        reject({input, error});
      }
    });
  }
  handleResponse(geoclientResponse) {
    const results = geoclientResponse.results;
    if (geoclientResponse.status === 'OK') {
      const location = this.parse(results[0]);
      if (results.length === 1 && this.isMappable(location.coordinate)) {
        location.type = 'geocode';
        return location;
      } else {
        return {
          type: 'ambiguous',
          input: geoclientResponse.input,
          possible: this.possible(results)
        };
      }
    } else {
      return {error: geoclientResponse};
    }
  }
  possible(results) {
    const possible = [];
    results.forEach(result => {
      possible.push(this.parse(result));
    });
    return possible;
  }
  parse(result) {
    const searchType = result.request.split(' ')[0];
    const response = result.response;
    let addrLine1, coordinate, accuracy;
    if (searchType === 'intersection') {
      addrLine1 = `${response.streetName1} and ${response.streetName2}`;
      coordinate = [response.xCoordinate * 1, response.yCoordinate * 1];
      accuracy = Locate.Accuracy.MEDIUM;
    } else if (searchType === 'blockface') {
      addrLine1 = response.firstStreetNameNormalized + ' btwn ' + response.secondStreetNameNormalized + ' & ' + response.thirdStreetNameNormalized;
      coordinate = [((response.fromXCoordinate * 1) + (response.toXCoordinate * 1)) / 2, ((response.fromYCoordinate * 1) + (response.toYCoordinate * 1)) / 2];
      accuracy = Locate.Accuracy.LOW;
    } else { /* address, bbl, bin, place */
      const x = response.internalLabelXCoordinate;
      const y = response.internalLabelYCoordinate;
      addrLine1 = (response.houseNumber ? (response.houseNumber + ' ') : '') + (response.firstStreetNameNormalized || response.giStreetName1);
      coordinate = [(x && y ? x : response.xCoordinate) * 1, (x && y ? y : response.yCoordinate) * 1];
      accuracy = x && y ? Locate.Accuracy.HIGH : Locate.Accuracy.MEDIUM;
    }
    if (!this.isMappable(coordinate)) {
      const error = response;
      error.message = 'No coordinate'; 
      return {error};
    }
    try {
      const addr = capitalize(`${addrLine1.replace(/  +/g, ' ')}, ${BORO[response.firstBoroughName]}`);
      const stateZip = `NY ${(response.zipCode || response.leftSegmentZipCode || '')}`;
      const name = `${addr}, ${stateZip}`;
      return {
        type: 'geocode',
        coordinate: project('EPSG:2263', 'EPSG:3857', coordinate),
        data: response,
        accuracy, /* approximation */
        name
      };
    } catch (badCoord) {
      const error = response;
      error.message = 'Bad coordinate'; 
      return {error};
    }
  }
  isMappable(coordinate) {
    return coordinate && !isNaN(coordinate[0]) && !isNaN(coordinate[1]);
  }
}

/**
 * @desc Constructor options for {@link module:js/locate/Geocode~Geocode}
 * @public
 * @typedef {Object}
 * @property {string} url The URL for accessing the Geoclient API (see {@link https://developer.cityofnewyork.us/api/geoclient-api})
 * @property {string} AppId The Geoclient App ID
 * @property {string} AppKey The Geoclient App Key
 */
Geocode.Options;

export default Geocode;
