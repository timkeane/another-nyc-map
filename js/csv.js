import $ from 'jquery';
import createMenu from './csvMenu';
import {nextId} from './util';
import Point from 'ol/geom/Point';

const HTML = `<div class="csv-table">
  <a class="btn-close corner" href="#" aria-role="button"
    data-i18n="[title]close;[aria-label]close">
  </a>
  <table>
    <thead><tr></tr></thead>
    <tbody></tbody>
  </table>
</div>`;

function compare(f0, f1) {
  const status0 = f0.get('status');
  const status1 = f1.get('status');
  if (status0 < status1) {
    return -1;
  } else if (status0 > status1) {
    return 1;
  }
  return 0;
}

function showHideColumn(event) {
  const check = $(event.target);
  const checked = check.is(':checked');
  const table = check.data('csv-table');
  const prop = check.data('csv-column');
  event.preventDefault();
  table.find(`th[data-prop="${prop}"], td[data-prop="${prop}"]`).css('display', checked ? 'table-cell' : 'none');
}

function columnsMenu(table, columns) {
  const ul = $('<ul></ul>');
  columns.forEach(column => {
    const id = nextId('column');
    const label = $(`<label for="${id}">${column}</label>`);
    const check = $(`<input id="${id}" name="${id}" type="checkbox" class="form-check-input" checked>`)
      .data('csv-table', table)
      .data('csv-column', column)
      .on('change', showHideColumn);
    ul.append($(`<li></li>`).append(check).append(label));
  });
  return ul;
}

function getAddress(geocode) {
  return `${geocode.houseNumber} ${geocode.firstStreetNameNormalized}`;
}

function updateFeature(event) {
  const target = $(event.target);
  const row = target.parent().parent();
  const feature = target.data('feature');
  const format = feature.get('format');
  const templateColumns = feature.get('_templateColumns');
  if (target.hasClass('possible')) {
    const index = target.val() * 1;
    if (index > -1) {
      const geocode = feature.get('_geocode');
      const location = geocode.possible[index];
      feature.setGeometry(new Point(location.coordinate));
      updateGeocode(row, feature, location, templateColumns);
    }
  } else {
    console.info('text', target);
    // re-geocode...
    const prop = target.attr('data-prop')
    feature.set(prop, target.val());
    const newFeature = format.readFeature(feature.getProperties());
    feature.set(newFeature.getProperties());
    format.geocodeFeature(feature);
    feature.once('change', () => {
      updateGeocode(row, feature, feature.get('_geocode'), templateColumns);
    });
    }
  }

function updateGeocode(row, feature, location, templateColumns) {
  const gocodeProps = {
    borough: 'firstBoroughName',
    city: 'uspsPreferredCityName',
    zip: 'zipCode'
  };
  Object.keys(templateColumns).forEach(key => {
    const prop = templateColumns[key];
    const geocode = location.data;
    const value = key === 'address' ? getAddress(geocode) : geocode[gocodeProps[key]];
    feature.set(prop, value);
    feature.set('_geocode', location);
    feature.set('status', 'geocode');
    row.find(`input[data-prop="${prop}"]`).val(value);
    row.find(`td.status`)
      .removeClass('ambiguous')
      .removeClass('error')
      .addClass('geocode')
      .html('geocode');
  });
}

function appendStatus(tr, feature) {
  const geocode = feature.get('_geocode');
  
  const status = geocode?.type || 'error';
  const td = $(`<td data-prop="status" class="status ${status}">${status}</td>`)
    .data('feature', feature);
  if (status === 'ambiguous') {
    const select = $(`<select class="possible"><option value="-1">${status}</option></select>`)
      .data('feature', feature);
    geocode.possible.forEach((geo, i) => {
      select.append(`<option value="${i}">${geo.name}</option>`);
    });
    td.empty().append(select.on('change', updateFeature));
  }
    
  feature.set('status', status);
  tr.append(td);
}

export default function csvTable(event) {
  const target = $(event.target);
  const view = target.data('legend').view;
  const layer = $(event.target).data('layer');
  const format = layer.getSource().getFormat();
  const templateColumns = format.templateColumns;
  const legend = $(event.target).data('legend');
  const source = layer.getSource();
  const features = source.getFeatures();
  const table = $(HTML); //TODO ??? find table not div
  const header = table.find('thead tr');
  const tbody = table.find('tbody');
  const props = features[0].getProperties();
  const columns = [];

  table.find('a.btn-close').on('click', () => table.fadeOut());

  header.append('<th>&nbsp</th><th class="status" data-i18n="csv.status"></th>');
  Object.keys(props).forEach(prop => {
    if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
      header.append(`<th data-prop="${prop}">${prop}</th>`);
      columns.push(prop);
    }
  });
  legend.close();
  table.data('features', features);
  createMenu(columnsMenu(table, columns));

  features.sort(compare);
  features.forEach((feature, i) => {
    const props = feature.getProperties();
    const a = $('<a href="#" class="map-btn" aria-role="button" data-i18n="csv.map"></a>');
    const tr = $('<tr></tr>');
    const td = $('<td class="map"></td>');
    a.on('click', () => {
      const center = feature.getGeometry().getCoordinates();
      if (!isNaN(center[0]) && !isNaN(center[1]))
        view.animate({center, zoom: 15});
    });
    tr.append(td.append(a));
    appendStatus(tr, feature);
    tbody.append(tr);
    feature.set('_templateColumns', templateColumns);
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry' && prop.substring(0, 1) !== '_') {
        const templateAddress = prop === templateColumns[0] ? 'template-address' : '';
        const templateCity = prop === templateColumns[1] ? 'template-city' : '';
        const input = $(`<input class="${templateAddress} ${templateCity}" name="prop${i}" data-prop="${prop}" type="text" value="${props[prop]}" autocomplete="off"></input>`)
          .data('feature', feature)
          .on('focus', () => input.trigger('select'))
          .on('change', updateFeature);
        tr.append($(`<td data-prop="${prop}"></td>`).append(input));
        }
    });
  });
  $('body').append(table.localize());
}
