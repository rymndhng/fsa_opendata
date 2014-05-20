var chartData = {}
var districts;
var schools;

function alphabeticalSortComparator(a, b){
    var nameA = a[1].toLowerCase().replace(/\W+/g, "");
    var nameB = b[1].toLowerCase().replace(/\W+/g, "");
    console.log(nameA + "--" + nameB + "--" + (nameA > nameB));
    if (nameA < nameB)
        return -1;
    else if (nameA > nameB)
        return 1;
    else
        return 0;
}

function fetchDistricts() {
    d3.json("/fsa/districts", function(data) {
        districts = data;
        districts = districts.sort(alphabeticalSortComparator);
        console.log(districts);

        district_select = document.querySelector("#district-select");
        for(var i=0; i < districts.length; i++) {
            pair = districts[i];
            id = pair[0];
            district_name = pair[1] ;
            new_option = document.createElement("option");
            new_option.setAttribute("value", id);
            if (!district_name) district_name = "Other...";
            new_option.innerHTML = district_name
            district_select.appendChild(new_option);
        }
    });
}

function fetchSchools(district_id) {
    d3.json("/fsa/districts/" + district_id + "/schools/", function(data) {
        schools = data;
        schools = schools.sort(alphabeticalSortComparator);
        console.log(schools);
        school_select = document.querySelector("#school-select");
        school_select.innerHTML = "";
        for(var i=0; i < schools.length; i++) {
            pair = schools[i];
            id = pair[0];
            school_name = pair[1] ;
            new_option = document.createElement("option");
            new_option.setAttribute("value", id);
            if (!school_name) school_name = "Other...";
            new_option.innerHTML = school_name
            school_select.appendChild(new_option);
        }
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

// google maps stuff
var mapOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 8
};

var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
