import $ from 'jquery';
import {getCurrentLanguage} from './i18n';
import Control from 'ol/control/Control';

const HTML = `<select class="form-control form-select btn translate" name="translate" data-i18n="[title]translate;[aria-label]translate">
  <option value="0" data-i18n="translate.en"></option>
</select>`;

const languages = ['en', 'es'];

export default function create(map) {
  const select = $(HTML).localize();

  map.addControl(new Control({
    element: select.get(0)
  }));

  select.on('change', () => {
    window.location = `${window.location.href.split('?')[0]}?locale=${select.val()}`;
  });

  languages.forEach(lang => {
    select.append(`<option data-i18n="locale.${lang}" value="${lang}"></option>`).localize();
  });

  let i = 0;
  let j = 0;
  const option = select.children().first();
  const interval = setInterval(() => {
    i = i < languages.length - 1 ? i + 1 : 0;
    j = j + 1;
    option.attr('data-i18n', `translate.${languages[i]}`).localize();
  }, 1000);

  select.on('click', () => {
    option.attr('data-i18n', `translate.${getCurrentLanguage()}`).localize();
    clearInterval(interval);
  });

  setTimeout(() => {
    clearInterval(interval);
    select.remove();
  }, 120000);
}
