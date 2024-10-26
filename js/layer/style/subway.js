const subwayLineStyle = [
  {
    'stroke-width': [
      'interpolate',
      ['exponential', 2], ['zoom'],
      10, 2,
      17, 10
    ],
    'stroke-color': [
      'case', 
      ['==', ['get', 'rt_symbol'], '1'], 'red',
      ['==', ['get', 'rt_symbol'], '4'], 'green',
      ['==', ['get', 'rt_symbol'], '7'], 'purple',
      ['==', ['get', 'rt_symbol'], 'A'], 'blue',
      ['==', ['get', 'rt_symbol'], 'B'], 'orange',
      ['==', ['get', 'rt_symbol'], 'G'], 'darkgreen',
      ['==', ['get', 'rt_symbol'], 'J'], 'maroon',
      ['==', ['get', 'rt_symbol'], 'L'], 'grey',
      ['==', ['get', 'rt_symbol'], 'N'], 'yellow',
      'green'
    ]
  }
];

const subwayStationStyle = {
  'circle-radius': [
    'interpolate',
    ['exponential', 2], ['zoom'],
    10, 2,
    17, 20
  ],
  'circle-stroke-width': [
    'interpolate',
    ['exponential', 2], ['zoom'],
    10, 1,
    17, 4
  ],
  'circle-fill-color': '#FFF',
  'circle-stroke-color': '#000'
};


export {subwayLineStyle, subwayStationStyle};