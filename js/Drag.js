import $ from 'jquery';
import {nextId} from './util';

const instances = {};

function drag(event) {
  const instanceId = $(event.target).data('instanceId');
  const instance = instances[instanceId];
  if (instance && instance.on) {
    event.preventDefault();
    instance.pos1 = instance.pos3 - event.clientX;
    instance.pos2 = instance.pos4 - event.clientY;
    instance.pos3 = event.clientX;
    instance.pos4 = event.clientY;
    instance.dragElem.css({
      top: `${instance.dragElem.get(0).offsetTop - instance.pos2}px`,
      left: `${instance.dragElem.get(0).offsetLeft - instance.pos1}px`
    });
    tail(instanceId);  
  }
}

function tail(instanceId) {
  const instance = instances[instanceId];
  const svg = $(instance.dragElem).find('path');
  if (instance) {
    const path = svg.attr('d');
    const parts = path.split(' ');
    parts[2] = `L${(parts[2].substring(1) * 1) + instance.pos1}`;
    parts[3] = `${(parts[3] * 1) + instance.pos2}`;
    svg.attr('d', parts.join(' '));
  }
}

function up(event) {
  Object.values(instances).forEach(instance => instance.on = false)
}

function down(event) {
  const instanceId = $(event.target).data('instanceId');
  const instance = instances[instanceId];
  event.preventDefault();
  if (instance) {
    instance.on = true;
    instance.pos3 = event.clientX;
    instance.pos4 = event.clientY;
    $(document).one('mouseup', up);
    $(document).on('mousemove', drag);
  }
}

export default class Drag {
  constructor(dragElem, dragHandle) {
    const instanceId = nextId('drag');
    this.dragElem = dragElem.data('instanceId', instanceId);
    this.dragHandle = dragHandle.data('instanceId', instanceId);
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    instances[instanceId] = this;
    dragHandle.on('mousedown', down);
  }
}
