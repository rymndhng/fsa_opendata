//Format A
var chart;
nv.addGraph(function() {
  chart = nv.models.scatterChart()
                .showDistX(true)
                .showDistY(true)
                .useVoronoi(true)
                .color(d3.scale.category10().range())
                .transitionDuration(300)
                ;

  chart.xAxis.tickFormat(d3.format('.02f'));
  chart.yAxis.tickFormat(d3.format('.02f'));
  chart.tooltipContent(function(key) {
      return '<h2>' + key + '</h2>';
  });

  d3.select('#test1 svg')
      .datum(randomData(4,40))
      .call(chart);

  nv.utils.windowResize(chart.update);

  chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

  return chart;
});

function notSoRandomData(groups, points) { //# groups,# points per group
  var data = [],
      shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        x: random(),
        y: random(),
        size: Math.random(),
        shape: shapes[j % 6]
      });
    }
  }

  return data;
}





function randomData(groups, points) { //# groups,# points per group
  var data = [],
      shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        x: random(),
        y: random(),
        size: Math.random(),
        shape: shapes[j % 6]
      });
    }
  }

  return data;
}



