import $ from 'jquery';
import Overlay from 'ol/Overlay';
import {pad} from '../util';
import Control from 'ol/control/Control';
import {showAlert} from '../dialog';
import {highlightByBbl} from '../info/pluto';

const env = import.meta.env;

const HTML = `<form class="locate-form location" style="pointer-events: auto;">
  <select name="type" class="form-control form-select btn type" data-i18n="[title]search.type;[aria-label]search.type">
    <option value="location" data-i18n="[prepend]search.location">&nbsp;&nbsp;&nbsp;&nbsp;</option>
    <option value="bbl" data-i18n="search.bbl"></option>
  </select>
  <input name="location" class="form-control location" data-i18n="[placeholder]placeholder.location" autocomplete="on">
  <select name="boro" class="form-control form-select bbl boro" data-i18n="[title]boro;[aria-label]boro" autocomplete="on">
    <option value="0" data-i18n="[prepend]boro">...</option>
    <option value="2">Bronx</option>
    <option value="3">Brooklyn</option>
    <option value="1">Manhattan</option>
    <option value="4">Queens</option>
    <option value="5">Staten Island</option>
  </select>
  <input name="block" class="form-control bbl block" data-i18n="[placeholder]placeholder.block" autocomplete="on">
  <input name="lot" class="form-control bbl lot" data-i18n="[placeholder]placeholder.lot" autocomplete="on">
  <button class="btn btn-primary search" name="submit" data-i18n="[title]search;[aria-label]search"></button>
  <div id="location"></div>
  <ul class="list-group possible"></ul>
</form>`;

class Form {
  constructor(options) {
    const form = $(HTML).localize();
    const map = options.map;
    if (options.target) {
      $(options.target).append(form);
    };
    form.on('submit ', this.search.bind(this));
    form.on('keyup', this.search.bind(this));
    this.searchType = form.find('select.type');
    this.searchType.on('change', this.setSearchType.bind(this));
    this.location = form.find('.location');
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
    if (this.location.is(':visible')) {
      return this.location.val();
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
    event.preventDefault();
    if (!event.key || event.key === 'Enter') {
      const input = this.val();
      if (input.length > 0) {
        this.geocode.locate(input).then(result => {
          if (result.type !== 'ambiguous') {
            this.location.val(result.name);
            this.goTo(result);
          } else {
            this.showPossible(result);
          }
        }).catch(error => {
          console.warn(error);
          showAlert($(`<span data-i18n="[append]geocode.fail">"${this.location.val()}" </span>`));
        });
      }
    }
  }
  goTo(result) {;
    const center = result.coordinate;
    this.map.getView().animate({center, zoom: 17});
    if (result.data.bbl) {
    this.pinOverlay.setPosition(undefined);
      highlightByBbl(result.data.bbl);
    } else {
    this.pinOverlay.setPosition(center);
  }
  }
  setSearchType() {
    this.form.removeClass('bbl').removeClass('location');
    this.form.addClass(this.searchType.val());
    this.location.trigger('focus');
    this.boro.trigger('focus');
  }
  showPossible(result) {
    this.possible.empty();
    result.possible.forEach(possible => {
      const name = possible.name;
      const li = $(`<li class="list-group-item focus-ring" tabindex="0">${name}</li>`);
      this.possible.append(li);
      li.on('click', () => {
        this.location.val(name);
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
