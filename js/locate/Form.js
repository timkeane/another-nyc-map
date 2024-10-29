import $ from 'jquery';
import Overlay from 'ol/Overlay';
import {pad} from '../util';
import Control from 'ol/control/Control';
import { showAlert } from '../dialog';

const HTML = `<form class="locate-form input" style="pointer-events: auto;">
  <input name="input" class="form-control input" placeholder="Enter a location...">
  <select name="boro" class="form-control form-select bbl boro" title="Borough" aria-label="Borough">
    <option value="0">Borough...</option>
    <option value="2">Bronx</option>
    <option value="3">Brooklyn</option>
    <option value="1">Manhattan</option>
    <option value="4">Queens</option>
    <option value="5">Staten Island</option>
  </select>
  <input name="block" class="form-control bbl block" placeholder="Block...">
  <input name="lot" class="form-control bbl lot" placeholder="Lot...">
  <select class="form-control form-select type">
    <option value="input">Search by location&nbsp;&nbsp;&nbsp;&nbsp;</option>
    <option value="bbl">Search by BBL</option>
  </select>
  <div id="location"></div>
  <ul class="list-group possible"></ul>
</form>`;

class Form {
  constructor(options) {
    const form = $(HTML);
    const map = options.map;
    if (options.target) {
      $(options.target).append(form);
    };
    form.on('keyup', this.search.bind(this));
    this.searchType = form.find('select.type');
    this.searchType.on('change', this.setSearchType.bind(this));
    this.input = form.find('.input');
    this.boro = form.find('.boro');
    this.block = form.find('.block');
    this.lot = form.find('.lot');
    this.possible = form.find('.possible');
    this.form = form;
    this.geocode = options.geocode;
    this.map = options.map;
    this.addControl();
  }
  addControl() {
    this.pinOverlay = new Overlay({
      element: this.form.find('#location').get(0),
      offset: [-24, -48],
      className: 'overlay-0 ol ol-overlay-container ol-selectable'
    });
    this.map.addOverlay(this.pinOverlay);
    this.map.addControl(new Control({
      element: this.form.get(0)
    }));
  }
  val() {
    if (this.input.is(':visible')) {
      return this.input.val();
    }
    return this.bbl();
  }
  bbl() {
    const boro = this.boro.val();
    if (boro !== '0') {
      const block = pad(this.block.val(), 5);
      const lot = pad(this.lot.val(), 4);
      this.block.val(block);
      this.lot.val(lot);
      return `${boro}${block}${lot}`;
    }
    return '';
  }
  search(event) {
    if (event.key === 'Enter') {
      const input = this.val();
      event.preventDefault();
      if (input.length > 0) {
        this.geocode.locate(input).then(result => {
          if (result.type !== 'ambiguous') {
            this.input.val(result.name);
            this.goTo(result);
          } else {
            this.showPossible(result);
          }
        }).catch(error => {
          console.warn(error);
          showAlert(`"${this.input.val()}" could not be located`);
        });
      }
    }
  }
  goTo(result) {;
    const center = result.coordinate
    this.map.getView().animate({center, zoom: 17});
    this.pinOverlay.setPosition(center);
  }
  setSearchType() {
    const searchType = this.searchType.val();
    this.form.removeClass('bbl').removeClass('input');
    this.form.addClass(searchType);
    this.input.trigger('focus');
    this.boro.trigger('focus');
  }
  showPossible(result) {
    this.possible.empty();
    result.possible.forEach(possible => {
      const name = possible.name;
      const li = $(`<li class="list-group-item focus-ring" tabindex="0">${name}</li>`);
      this.possible.append(li);
      li.on('click', () => {
        this.input.val(name);
        this.goTo(possible);
        this.possible.slideUp();
      });
    });
    if (this.possible.children().length > 0) {
      this.possible.slideDown();
    }
  }
}

export default Form;
