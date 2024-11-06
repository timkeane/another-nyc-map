import GeoJSON from 'ol/format/GeoJSON';
import Source from 'ol/source/Vector';
import WebGLVectorLayer from './WebGL';
import {sirLineStyle, subwayLineStyle, subwayStationStyle} from './style/subway';
import {sirLineHtml, subwayLineHtml, subwayStationHtml, sirLineTip, subwayLineTip, subwayStationTip} from './html/subway';
import LayerGroup from 'ol/layer/Group';
import {urls} from '../urls';

const env = import.meta.env;

const format = new GeoJSON({
  featureProjection: 'EPSG:3857',
  dataProjection: 'EPSG:4326'
});

const sirLine = new WebGLVectorLayer({
  source: new Source({
    format,
    url: urls.layer.sirLine
  }),
  style: sirLineStyle
});
sirLine.set('name', 'subway.sir');
sirLine.set('html', sirLineHtml);
sirLine.set('tip', sirLineTip);

const subwayLine = new WebGLVectorLayer({
  source: new Source({
    format,
    url: urls.layer.subwayLine
  }),
  style: subwayLineStyle
});

subwayLine.set('name', 'subway.line');
subwayLine.set('html', subwayLineHtml);
subwayLine.set('tip', subwayLineTip);

const subwayStation = new WebGLVectorLayer({
  source: new Source({
    format,
    url: urls.layer.subwayStation
  }),
  style: subwayStationStyle
});

subwayStation.set('name', 'subway.station');
subwayStation.set('html', subwayStationHtml);
subwayStation.set('tip', subwayStationTip);

const group = new LayerGroup({layers: [sirLine, subwayLine, subwayStation]});
group.set('name', 'subway');

export default group;