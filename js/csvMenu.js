import $ from 'jquery';

const FORM = `<form class="csv-menu">
  <a class="btn-close corner" href="#" aria-role="button"
    data-i18n="[title]close;[aria-label]close">
  </a>
  <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle" type="button"
      data-bs-toggle="dropdown" aria-expanded="false" data-i18n="csv.columns">
    </button>
  </div>
</form>`;

export default function create(parent, ul) {
  const form = $(FORM);
  form.find('.dropdown').append(ul.addClass('dropdown-menu'));
  form.find('a.btn-close').on('click', () => {
    form.fadeOut();
    parent.fadeOut();
  });
  $('body').append(form.localize());
  return form;
}
