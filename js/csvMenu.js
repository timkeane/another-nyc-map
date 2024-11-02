import $ from 'jquery';
import Storage from './Storage';

const FORM = `<form class="csv-menu">
  <h2></h2>
  <button class="btn btn-primary save"
  data-i18n="[title]csv.save;[aria-label]csv.save">
  </button>
  <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle" type="button"
      data-bs-toggle="dropdown" aria-expanded="false" data-i18n="csv.columns">
    </button>
  </div>
  <a class="btn-close corner" href="#" aria-role="button"
    data-i18n="[title]close;[aria-label]close">
  </a>
</form>`;

function save(layer) {
  const source = layer.getSource();
  const format = source.getFormat();
  const csv = format.writeFeatures(source.getFeatures());
  Storage.saveCsv(`geocoded.${layer.get('file')}`, csv);
}

export default function create(layer, parent, ul) {
  const form = $(FORM);
  form.find('h2').html(layer.get('file'));
  form.find('.dropdown').append(ul.addClass('dropdown-menu'));
  form.find('a.btn-close').on('click', () => {
    form.fadeOut();
    parent.fadeOut();
  });
  form.on('submit', event => {
    event.preventDefault();
    save(layer);
});
  $('body').append(form.localize());
  return form;
}
