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
      ['==', ['get', 'rt_symbol'], '1'], '#EE352E',
      ['==', ['get', 'rt_symbol'], '4'], '#00933C',
      ['==', ['get', 'rt_symbol'], '7'], '#B933AD',
      ['==', ['get', 'rt_symbol'], 'A'], '#0039A6',
      ['==', ['get', 'rt_symbol'], 'B'], '#FF6319',
      ['==', ['get', 'rt_symbol'], 'G'], '#6CBE45',
      ['==', ['get', 'rt_symbol'], 'J'], '#963',
      ['==', ['get', 'rt_symbol'], 'L'], '#A7A9AC',
      ['==', ['get', 'rt_symbol'], 'N'], '#FCCC0A',
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