import $ from 'jquery';
import Basemap from './Basemap';
import Geocode from './locate/Geocode';
import Form from './locate/Form';
import layers from './layer/layers';
import Legend from './Legend';

const env = import.meta.env;

const map = new Basemap({target: 'map'});

layers.forEach(layer => map.addLayer(layer));

$('.ol-control button').addClass('btn btn-primary');

const geocode = new Geocode({
  url: env.VITE_GEOCLIENT_URL,
  appId: env.VITE_GEOCLIENT_ID,
  appKey: env.VITE_GEOCLIENT_KEY
});

const form = new Form({map, geocode});
const legend = new Legend({target: 'body', map, layers});

map.on('rendercomplete', () => $('body').removeClass('loading'));

window.app = {map, geocode, form};