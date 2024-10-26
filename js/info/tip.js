import $ from 'jquery';

function generic(feature) {
  const properties = feature.getProperties();
  const prop = properties.name ? 'name' : Object.keys(properties)[1];
  const tip = properties[prop];
  return $(`<div class="feature-tip"><strong>${prop}:</strong> ${tip}</div>`);
}

export function show(event) {
  const map = event.map;
  map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
    const tipFn = layer.get('tip') || generic;
    const tip = tipFn(feature);
  });
}
