import $ from 'jquery';
import initI18n from './i18n/i18n';
import createTranslate from './i18n/translate';
import Basemap from './Basemap';
import Geocode from './locate/Geocode';
import Form from './locate/Form';
import layers from './layer/layers';
import Legend from './Legend';

const env = import.meta.env;

const geocode = new Geocode({
  url: env.VITE_GEOCLIENT_URL,
  appId: env.VITE_GEOCLIENT_ID,
  appKey: env.VITE_GEOCLIENT_KEY
});

initI18n().then(() => {
  const map = new Basemap({target: 'map'});

  createTranslate(map);

  layers.forEach(layer => map.addLayer(layer));

  $('#map .ol-control button').addClass('btn btn-primary form-control').empty();
  $('#map .ol-zoom-in').attr('data-i18n', '[title]map.zoom.in;[aria-label]map.zoom.in');
  $('#map .ol-zoom-in').attr('data-i18n', '[title]map.zoom.out;[aria-label]map.zoom.out');

  new Form({map, geocode});
  new Legend({map, layers});

  function ready() {
    $('body').removeClass('loading');
    setTimeout(() => $('h1.banner').slideUp(), 20000);
    map.un('rendercomplete', ready);
  }
  map.on('rendercomplete', ready);

  $(document).on('mousemove', event => {
    if (event.clientY === 0) {
      $('h1.banner')
        .on('click', () => $('h1.banner').slideUp())
        .slideDown(() => setTimeout(() => $('h1.banner').slideUp(), 5000));
    }
  });
});