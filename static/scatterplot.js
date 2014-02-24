//Format A
var chart;
nv.addGraph(function() {
  // chart = nv.models.scatterChart()
  //               .showDistX(true)
  //               .showDistY(true)
  //               .useVoronoi(true)
  //               .color(d3.scale.category10().range())
  //               .transitionDuration(300)
  //               ;


  chart = nv.models.lineChart()
  .options({
    margin: {left: 100, bottom: 100},
    x: function(d,i) { return i},
    showXAxis: true,
    showYAxis: true,
    transitionDuration: 250
  });





  chart.xAxis.tickFormat(d3.format('.02f'))
             .axisLabel("Year");
  chart.yAxis.tickFormat(d3.format('.02f'))
             .axisLabel("FSA Numeracy Score");

  chart.tooltipContent(function(key, x, y, e, graph) {
      var args = Array.prototype.slice.apply(arguments);
      return '<h2>' + key + '</h2>';
  });

  // d3.select('#test1 svg')
  //     .datum(notSoRandomData(4,40))
  //     .call(chart);

  nv.utils.windowResize(chart.update);

  chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

  $('#filter-region').on('click', function() {
    $.ajax('filterbyregion', function(response) {

      data = massage(response);

      // TODO: massage this
      d3.select('#test1 svg')
            .datum(notSoRandomData(10,5))
            .call(chart);
    });
  });

  $.ajax({url:'http://192.168.1.188:9000/',
          success: function(response) {
              d3.select('#test1 svg')
                   .datum(massage(response))
                   .call(chart);
          }
    }
  );

  return chart;
});

function massage(response) {
  var data = [],
      regions = [],
      schools = [],
      shapes = ['circle'],
      keys = ['FEMALE', 'MALE'];

  schools = _.unique(response, false, function(elem) {
    return elem.school_name;
  }).map(function(elem) { return elem.school_name; });

  var extract_data = function(elem) {
      return {
        school: elem.school_name,
        x: elem.school_year.split("/")[0],
        y:  elem.score,
        size: elem.participation_rate/10
      }
  }


  predata = {};
  _.each(schools, function(elem) {
    predata[elem] = [];
  });

  _.each(response, function(elem) {
    predata[elem.school_name].push(extract_data(elem));
  })

  for (var key in predata) {
    data.push({
      key: key,
      values: predata[key]
    });
  }

  return data;
}

function notSoRandomData(groups, points) { //# groups,# points per group
  var data = [],
      regions = ['van', 'victoria', 'kootenay'],
      shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        school: "School I",
        region: regions[j %3],
        x: random(),
        y: random(),
        rgb: '5',
        opacity: Math.random(),
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
        clss: "foo",
        name: "School I",
        x: random(),
        y: random(),
        size: Math.random(),
        shape: shapes[j % 6]
      });
    }
  }

  return data;
}



