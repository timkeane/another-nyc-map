import Layer from 'ol/layer/Layer';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer';

export default class WebGLVectorLayer extends Layer {
  constructor(options) {
    super(options);
    this.style = options.style;
  }
  createRenderer() {
    return new WebGLVectorLayerRenderer(this, {
      style: this.style
    });
  }
}
