import $ from 'jquery';

const HTML = `<div class="csv-table">
  <table>
    <thead><tr></tr><theaad>
    <tbody></tbody>
  </table>
</div>`;

function updateFeature(event) {
  const input = $(event.target);
  const feature = input.data('feature');
  const prop = input.data('prop');
  feature.set(prop, input.val());
  
}

export default function csvTable(event) {
  const layer = $(event.target).data('layer');
  const legend = $(event.target).data('legend');
  const source = layer.getSource();
  const features = source.getFeatures();
  const html = $(HTML);
  const header = html.find('thead tr');
  const tbody = html.find('tbody');
  const props = features[0].getProperties();
  Object.keys(props).forEach(prop => {
    if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
      header.append(`<th>${prop}</th>`);
    }
  });
  legend.close();

  features.forEach(feature => {
    const props = feature.getProperties();
    const tr = $('<tr></tr>');
    tbody.append(tr);
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
        const input = $(`<input data-prop="${prop}" type="text" value="${props[prop]}"></input>`)
          .data('feature', feature)
          .on('change', updateFeature);
        tr.append($('<td></td>').append(input));
        }
    });
  });
  $('body').append(html);
}
