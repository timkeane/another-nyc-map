import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';

const env = import.meta.env;

const fill = new Fill({
  color: env.VITE_GENERIC_FILL_COLOR,
});

const stroke = new Stroke({
  color: env.VITE_GENERIC_STROKE_COLOR,
  width: env.VITE_GENERIC_STROKE_WIDTH,
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
