import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';

const fill = new Fill({
  color: 'rgba(0, 0, 0, .25)',
});

const stroke = new Stroke({
  color: 'rgba(0 0, 0 ,.5)',
  width: 2,
});
   
export default [
  new Style({
    image: new Circle({
      fill: fill,
      stroke: stroke,
      radius: 10,
    }),
    fill: fill,
    stroke: stroke,
  }),
];
