import $ from 'jquery';
import initI18n from './i18n/i18n';
import createTranslate from './i18n/translate';
import Basemap from './Basemap';
import Geocode from './locate/Geocode';
import Form from './locate/Form';
import layers from './layer/layers';
import Legend from './Legend';
import createPrint from './print';

const env = import.meta.env;

const geocode = new Geocode({
  url: env.VITE_GEOCLIENT_URL,
  appId: env.VITE_GEOCLIENT_ID,
  appKey: env.VITE_GEOCLIENT_KEY
});

initI18n().then(() => {
  const map = new Basemap({target: 'map'});
  
  createTranslate(map);
  createPrint(map);

  layers.forEach(layer => map.addLayer(layer));

  $('#map .ol-control button').addClass('btn btn-primary form-control').empty();
  $('#map .ol-zoom-in').attr('data-i18n', '[title]map.zoom.in;[aria-label]map.zoom.in');
  $('#map .ol-zoom-out').attr('data-i18n', '[title]map.zoom.out;[aria-label]map.zoom.out');

  new Form({map, geocode});
  new Legend({map, layers});

  function hideBanner() {
    $('h1.banner').slideUp(() => $('html').css('overflow', 'visible'));
  }

  $('h1.banner img').on('click', () => window.location.reload());
  function ready() {
    $('html').css('overflow', 'hidden');
    $('body').removeClass('loading');
    setTimeout(hideBanner, 20000);
    map.un('rendercomplete', ready);
  }

  map.on('rendercomplete', ready);

  $(document).on('mousemove', event => {
    if (event.clientY === 3) {
      $('html').css('overflow', 'hidden');
      $('h1.banner').slideDown(() => setTimeout(hideBanner, 5000))
        .one('click', hideBanner);
    }
  });
});
