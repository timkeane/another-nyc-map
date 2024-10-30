import $ from 'jquery';
import i18next from 'i18next';
import jqueryI18next from 'jquery-i18next';

const defaultLocale = 'en';

function getLocale() {
  const match = document.location.search.match(/[?&]locale=([^&]+).*$/);
  let locale = match ? match[1] : undefined;
  
  if (locale !== undefined) {
    return locale.split('-')[0];
  }
  locale = navigator.language.split('-')[0];
  if (locale === defaultLocale) {
    return locale;
  }
  document.location = `./?locale=${locale}`;
}

function getDirection(lng) {
  return i18next.dir(lng);
}

function addTranslation(locale) {
  return new Promise((resolve, reject) => {
    if (locale !== defaultLocale) {
      import(`./translations/${locale}.js`).then(translation => {
        if (translation !== undefined) {
          resolve({locale, translation});
        }
      }).catch(error => {
        console.warn(`No translations for locale="${locale}"`);
        resolve({locale: defaultLocale});
      });
    } else {
      resolve({locale: defaultLocale})
    }
  })
}

export function getCurrentLanguage() {
  return i18next.language || defaultLocale;
}

export default function init() {
  const locale = getLocale();
  return new Promise((resolve, reject) => {
    import(`./translations/en.js`).then(en => {
      const resources = {en};
      addTranslation(locale, resources).then(resource => {
        const lng = resource.locale;
        if (lng !== defaultLocale) {
          resources[lng] = resource.translation;
          $('#map-container').attr('dir', 'ltr');
          $('html').attr('lang', lng).attr('dir', getDirection(lng));
        }
        i18next.init({
          defaultLocale,
          fallbackLng: defaultLocale,
          defaultNS: 'translation',
          resources,
          lng
        }, (err, t) => {
          jqueryI18next.init(i18next, $, {useOptionsAttr: true});
          $('[data-i18n]').localize();
          resolve(resources);
        });
      });
    }).catch(error => {
      console.error({error, message: `Failed to load default translations for ${state}`});
      reject();
    });
  }).catch(error => console.error({error, message: 'Failed to initialize i18n'}));
}
