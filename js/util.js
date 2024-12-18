export const BORO = {
  '1': 'Manhattan',
  '2': 'Bronx',
  '3': 'Brooklyn',
  '4': 'Queens',
  '5': 'Staten Island',
  'MANHATTAN': 'Manhattan',
  'BRONX': 'Bronx',
  'BROOKLYN': 'Brooklyn',
  'QUEENS': 'Queens',
  'STATEN IS': 'Staten Island',
  'MN': 'Manhattan',
  'BX': 'Bronx',
  'BK': 'Brooklyn',
  'QN': 'Queens',
  'SI': 'Staten Island'
};

export function boroughName(code) {
  return BORO[code];
}

export function pad(string, length) {
  let result = string?.trim() || '';
  while (result.length < length) {
    result = `0${result}`;
  }
  return result;
}

const uniqeIds = {};
export function nextId(prefix) {
  uniqeIds[prefix] = uniqeIds[prefix] ? uniqeIds[prefix] + 1 : 1;
  return `${prefix}${uniqeIds[prefix]}`;
}

export function replace(str, values) {
  Object.keys(values).forEach(name => {
    const value = values[name] !== undefined ? values[name] : '';
    str = str.replace(new RegExp('\\$\\{' + name + '\\}', 'g'), value);
  });
  return str;
}

export function enAlphabet(name) {
  return name.replace(/\./g, '')
  .replace(/\'/g, '')
  .replace(/ /g, '-')
  .replace(/\'/g, '')
  .replace(/á/g, '')
  .replace(/é/g, '')
  .replace(/í/g, '')
  .replace(/é/g, '')
  .replace(/ó/g, '')
  .replace(/ú/g, '')
  .replace(/ü/g, '')
  .replace(/ñ/g, '');
}
