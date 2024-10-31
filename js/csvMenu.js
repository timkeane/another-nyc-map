import $ from 'jquery';

const FORM = `<form class="csv-menu">
  <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle" type="button"
      data-bs-toggle="dropdown" aria-expanded="false" data-i18n="csv.columns">
    </button>
  </div>
</form>`;

export default function create(ul) {
  const form = $(FORM);
  form.find('.dropdown').append(ul.addClass('dropdown-menu'));
  $('body').append(form.localize());
}
