import $ from 'jquery';
import ScaleLine from 'ol/control/ScaleLine';
import {adjustForPrint} from './info/popup';

export default function(map) {
  const view = map.getView();
  $(window).on('beforeprint', () => {
    $('#map').addClass('print');
    view.fit(view.calculateExtent(map.getSize()));
    adjustForPrint();
    $('.popup-overlay').each((i, overlay) => {
      $(overlay).find('.popup.min').each((i, popup) => {
      const info = $('<div class="print-info"></div>').html($(popup).html());
      $('body').append(info);
      info.find('.popup-content').show();
      });
    });
  });
  $(window).on('afterprint', () => {
    $('div.print-info').remove();
    $('#map').removeClass('print');
    view.fit(view.calculateExtent(map.getSize()));
    adjustForPrint();
  });
}
