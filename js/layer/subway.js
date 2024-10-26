import GeoJSON from 'ol/format/GeoJSON';
import Source from 'ol/source/Vector';
import WebGLVectorLayer from './WebGL';
import {subwayLineStyle, subwayStationStyle} from './style/subway';
import {subwayLineHtml, subwayStationHtml, subwayLineTip, subwayStationTip} from './html/subway';
import LayerGroup from 'ol/layer/Group';

const env = import.meta.env;

const format = new GeoJSON({
  featureProjection: 'EPSG:3857',
  dataProjection: 'EPSG:4326'
});

const subwayLine = new WebGLVectorLayer({
  source: new Source({
    format,
    url: env.VITE_SUBWAY_LINE_URL
  }),
  style: subwayLineStyle
});

subwayLine.set('name', 'Subway Line');
// subwayLine.set('html', subwayLineHtml);
// subwayLine.set('tip', subwayLineHtml);

const subwayStation = new WebGLVectorLayer({
  source: new Source({
    format,
    url: env.VITE_SUBWAY_STATION_URL
  }),
  style: subwayStationStyle
});

subwayStation.set('name', 'Subway Station');
// subwayStation.set('html', subwayStationHtml);
// subwayStation.set('tip', subwayStationHtml);

const group = new LayerGroup({layers: [subwayLine, subwayStation]});
group.set('name', 'Subway');

export default group ;