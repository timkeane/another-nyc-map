import $ from 'jquery';
import ScaleLine from 'ol/control/ScaleLine';

export default function(map) {
  const view = map.getView();
  $(window).on('beforeprint', () => {
    $('#map').addClass('print');
    view.fit(view.calculateExtent(map.getSize()));
    $('.popup-overlay').each((i, overlay) => {
      $(overlay).find('.popup.min').each((i, popup) => {
        if ($(popup).find('.btn-min.max').length === 1) {
          const info = $('<div class="print-info"></div>').html($(popup).html());
          $('body').append(info);
          info.find('.popup-content').show();
        }
      });
    });
  });
  $(window).on('afterprint', () => {
    $('#map').removeClass('print');
    view.fit(view.calculateExtent(map.getSize()));
    $('div.print-info').remove();
  });
}
