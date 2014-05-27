var chartData = {}
var districts;
var schools;

function alphabeticalSortComparator(a, b){
    var nameA = a[1].toLowerCase().replace(/\W+/g, "");
    var nameB = b[1].toLowerCase().replace(/\W+/g, "");
    // console.log(nameA + "--" + nameB + "--" + (nameA > nameB));
    if (nameA < nameB)
        return -1;
    else if (nameA > nameB)
        return 1;
    else
        return 0;
}


function fetchSchools(district_id) {
    d3.json("/fsa/districts/" + district_id + "/schools/", function(data) {
        schools = data;
        schools = schools.sort(alphabeticalSortComparator);
        // console.log(schools);
        school_select = document.querySelector("#school-select");
        school_select.innerHTML = "";

        schools.forEach(function(elem) {
            var district_id = elem[0];
            var school_name = elem[1];
            var query_params = "district_id="+district_id+"&school_name="+school_name;
            var new_option = document.createElement("option");
            new_option.setAttribute("value", query_params);
            if (!school_name) school_name = "Other...";
            new_option.innerHTML = school_name;
            school_select.appendChild(new_option);
        });
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
    center: new google.maps.LatLng(49.2515436,-123.1049354),
    zoom: 12
};

var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

d3.json("schools", function(resp) {

    // ----------------- LOAD Typeahead/Bloodhoud
    var schoolMatcher = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(resp, function(s) { return {value: [s.school_name, s.district_long_name_this_enrol, s.school_city, s.physical_school_address].join(' ')}})
    });

    schoolMatcher.initialize();

    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'states',
        displayKey: 'value',
        source: schoolMatcher.ttAdapter()
    });


    // ----------------- LOAD MAPS VIS
    $('#map-canvas').on('click', '.add-school', function(e) {
        console.log("foo");
    });

    var _template =
        "<p>"+
            "<h5>{{school_name}}</h5>"+
            "{{school_address}}"+
        "</p>"+
        "<div>"+
            "<button class='btn btn-primary btn-xs add-school' value='{{district_id}}.{{school_id}}'>Add to chart!</button>"+
        "</div>";

    var infowindow = new google.maps.InfoWindow({
    });

    resp.forEach(function(s) {
        // define content
        var content = _template.split("{{school_name}}").join(s.school_name)
                               .split("{{district_id}}").join(s.district_number)
                               .split("{{school_id}}").join(s.id)
                               .split("{{school_address}}").join(s.school_physical_address);

        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);
        var marker = new google.maps.Marker({
            position: latlng,
            title: "Hello World!"
        });
        marker.setMap(map);

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(content);
            infowindow.latlng = latlng;
            infowindow.open(map, this);
        });
    });
});

