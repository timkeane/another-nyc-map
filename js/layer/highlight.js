import Source from 'ol/source/Vector';
import WebGLVectorLayer from './WebGL';
import highlightStyle from './style/highlight';

export default new WebGLVectorLayer({
  source: new Source(),
  style: highlightStyle
});