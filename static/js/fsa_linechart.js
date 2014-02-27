var chartData = {}

function fetchDataAndDrawChart() {
    d3.json("/fsa/data?school_id=1", function(data) {
        addData(parseToXY(data));
        drawChart();
    });
}

function addData(data) {
    for (var i=0; i < data.length; i++) {
        obj = data[i];
        chartData[obj.key] = obj;
    }
}

function drawChart() {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
      ;

      chart.xAxis
          .axisLabel('Time (ms)')
          .tickFormat(d3.format(',r'));

      chart.yAxis
          .axisLabel('Voltage (v)')
          .tickFormat(d3.format('.02f'));

      d3.select('#chart svg')
          .datum(_.values(chartData))
        .transition().duration(500)
          .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
}

function parseToXY(response) {
      var formattedData;
      var data = {};
      var schools = [];
    
      schools = _.chain(response)
          .map(function(elem) {
              return elem.school_name
          })
          .unique(false)
          .value();

      _.each(schools, function(elem) {
          data[elem] = [];
      });

      _.each(response, function(elem) {
          data[elem.school_name].push(
              {
                  x: elem.school_year.split("/")[0],
                  y: elem.score
              })
      });
    
      formattedData = _.map(data, function(v, k) {
          return { key: k, values: v }
      });

      return formattedData
}
