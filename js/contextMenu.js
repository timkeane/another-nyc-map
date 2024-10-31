import $ from 'jquery';
import {nextId} from './util';

const FORM = `<form class="context-menu">
  <h3 data-i18n="[prepend]column.show.hide">
    <a class="btn-close corner" href="#" aria-role="button"
      data-i18n="[title]close;[aria-label]close">
    </a>
  </h3>
</form>`;

function show(event) {
  const target = $(event.currentTarget);
  const menu = $(`#${target.data('context-menu')}`);
  menu.css({left: event.clientX, top: event.clientY - menu.height() / 2});
  event.preventDefault();
  menu.fadeIn();
}

export default function create(target, ul) {
  const id = nextId('context-menu');
  const form = $(FORM).attr('id', id).append(ul);
  $(target).data('context-menu', id).on('contextmenu', show);
  form.find('a.btn-close').on('click', () => form.fadeOut());
  $('body').append(form.localize());
}
