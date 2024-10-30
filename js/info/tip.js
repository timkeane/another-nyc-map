import $ from 'jquery';
import Overlay from 'ol/Overlay';
import {nextId} from '../util';

const HTML = '<div class="feature-tip" role="tooltip"></div>';

class FeatureTip extends Overlay {
  constructor(options) {
    const element = $(options.map.getTargetElement())
      .find('.feature-tip')
      .get(0);
    super({
      id: nextId('tip'),
      element: element || $(HTML).get(0),
      offset: [5, 5],
      className: 'overlay-1 ol ol-overlay-container ol-selectable'
    });
    this.setMap(options.map);
    this.map = this.getMap();
    this.tip = $(this.getElement());
    this.map.on('pointermove', this.label.bind(this));
  }
  hide() {
    this.tip.fadeOut(() => {
      this.setPosition(undefined);
    });
  }
  out(event) {
    if (!$.contains(this.map.getTargetElement(), event.target)) {
      this.hide();
    }
  }
  label(event) {
    const label = this.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      const tip = layer.get('tip') || generic;
      return layer.getVisible() ? tip(feature) : null;
    });
    if (label) {
      this.tip.html(label.html).localize();
      this.tip.get(0).className = `feature-tip ${label.css || ''}`;
      this.setPosition(event.coordinate);
      this.tip.show();
      this.position();
    } else {
      this.hide();
    }
  }
  position() {
    const size = this.map.getSize();
    const width = this.tip.width();
    const height = this.tip.height();
    const position = this.map.getPixelFromCoordinate(this.getPosition());
    const vert = position[1] + height > size[1] ? 'bottom' : 'top';
    const horz = position[0] + width > size[0] ? 'right' : 'left';
    this.setPositioning(`${vert}-${horz}`);
  }
}

/**
 * @desc Object with configuration options for feature tips
 * @public
 * @typedef {Object}
 * @property {module:ol/layer/Vector} layer The layer whose features will have tips
 * @property {module:FeatureTip~FeatureTip.LabelFunction} label A function to generate tips
 */
FeatureTip.TipDef;

/**
 * @desc Label function that returns a {@link module:FeatureTip/~FeatureTip.Label}
 * @public
 * @typedef {function(ol.Feature):module:FeatureTip~FeatureTip.Label}
 */
FeatureTip.LabelFunction;

/**
 * @desc Object type to return from a feature's label function
 * @public
 * @typedef {Object}
 * @property {jQuery|Element|string} html The tip content
 * @property {string=} css A CSS class to apply to the tip
 */
FeatureTip.Label;

/**
 * @desc Constructor options for FeatureTip
 * @public
 * @typedef {Object}
 * @property {module:ol/Map} map The map
 * @property {Array<module:FeatureTip~FeatureTip.TipDef>} tips The tip definitions
 */
FeatureTip.Options;

function generic(feature) {
  const properties = feature.getProperties();
  const prop = properties.name ? 'name' : Object.keys(properties)[1];
  const tip = properties[prop];
  return {html: $(`<div><strong>${prop}:</strong> ${tip}</div>`)};
}

export default function createFeatureTips(map) {
  new FeatureTip({map});
}
