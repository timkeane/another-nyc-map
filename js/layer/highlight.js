import Source from 'ol/source/Vector';
import WebGLVectorLayer from './WebGL';
import highlightStyle from './style/highlight';
import { plutoTip } from './html/pluto';
const layer = new WebGLVectorLayer({
  source: new Source(),
  style: highlightStyle
});

layer.set('name', 'highlight');
layer.set('tip', plutoTip);

export default layer;