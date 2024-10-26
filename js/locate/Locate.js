class Locate {
  locate() {
    throw 'Not implemented';
  }
}

/**
 * @desc Object type to hold data about a successful result of a locate request
 * @public
 * @typedef {Object}
 * @property {string} name The formatted name of the result location
 * @property {string} type The location type
 * @property {Array<number>} coordinate The location coordinate
 * @property {number} accuracy The accuracy of the geocoded location in meters or units of a specified projection
 * @property {Object=} data Additional properties provided by the geocoder
 */
Locate.Location;

/**
 * @desc Object type to hold data about possible locations resulting from a locate request
 * @public
 * @typedef {Object}
 * @property {string=} input User input
 * @property {Array<module:js/locate/Locate~Locate.Location>} possible An array of possible results to the request
 */
Locate.Ambiguous;

/**
 * @desc Object type to hold data about a failed locate request
 * @public
 * @typedef {Object}
 * @property {string=} input User input
 * @property {Object} error An error object
 */
Locate.Error;

/**
 * @desc Object type to hold the result of a locate request
 * @public
 * @typedef {module:js/locate/Locate~Locate.Location|module:js/locate/Locate~Locate.Ambiguous|module:js/locate/Locate~Locate.Error}
 */
Locate.Result;

/**
 * @desc Enumeration for approximate Geocoder accuracy in meters
 * @public
 * @enum {number}
 */
Locate.Accuracy = {
  /**
   * @desc High accuracy
   */
  HIGH: 0,
  /**
   * @desc Medium accuracy
   */
  MEDIUM: 50,
  /**
   * @desc Low accuracy
   */
  LOW: 500,
  /**
   * @desc ZIP Code accuracy
   */
  ZIP_CODE: 1000
};

export default Locate;
