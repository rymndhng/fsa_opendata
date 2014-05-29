var chartData = {}
var districts;
var schools;

function drawError(msg) {
    var template = Handlebars.compile("<div class='alert alert-warning'>{{msg}}</div>");
    var content = $(template({msg: msg}));
    $("#notification-console").append(content);
    setTimeout(function() { content.fadeOut(500, function() { $(this).remove()}) }, 1000);
}

function addData(data) {
    if (data.length == 0) {
        drawError("Selected school does not have any FSA scores in this period");
    }
    for (var i=0; i < data.length; i++) {
        obj = data[i];
        chartData[obj.key] = obj;
    }
}

function drawChart() {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
            .useInteractiveGuideline(true);

      chart.xAxis
          .axisLabel('Year')
          .tickFormat(d3.format('04d'));

      chart.yAxis
          .axisLabel('FSA Math Score')
          .tickFormat(d3.format('02d'));

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

// ------------- Setup Google Maps
var mapOptions = {
    center: new google.maps.LatLng(49.2515436,-123.1049354),
    zoom: 12
};

var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

function addSchool(district_id, school_name) {
    d3.json("data?district_id="+district_id+"&school_name="+school_name, function (resp) {
        addData(parseToXY(resp));
        drawChart();
    });
}

d3.json("schools", function(resp) {
    function hash_school_key(school) {
        return [school.district_number, school.school_name].join(":");
    }

    // map of points to lookup from infobox by schoolname & id
    var gmap_markers = {};

    // ----------------- LOAD MAPS VIS
    $('#map-canvas').on('click', '.add-school', function(e) {
        var district_id, school_name;
        results = e.target.value.split(":");
        district_id = results[0];
        school_name = results[1];
        addSchool(district_id, school_name);
    });

    var _template =
        "<p>"+
            "<h5>{{school_name}}</h5>"+
            "{{school_address}}"+
        "</p>"+
        "<div>"+
            "<button class='btn btn-primary btn-xs add-school' value='{{district_id}}:{{school_name}}'>Add to chart!</button>"+
        "</div>";

    var infowindow = new google.maps.InfoWindow({
    });

    resp.forEach(function(s) {
        // define content
        var content = _template.split("{{school_name}}").join(s.school_name)
                               .split("{{district_id}}").join(s.district_number)
                               .split("{{school_address}}").join(s.school_physical_address);

        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);
        var marker = new google.maps.Marker({
            position: latlng,
            title: "Hello World!"
        });
        marker.setMap(map);

        // store this in a lookup
        gmap_markers[hash_school_key(s)] = marker;

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(content);
            infowindow.latlng = latlng;
            infowindow.open(map, this);
        });
    });

    // ----------------- LOAD Typeahead/Bloodhoud
    var schoolMatcher = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(resp, function(s) {
            s.value = [s.school_name, s.district_long_name_this_enrol, s.school_city, s.physical_school_address].join(' ');
            return s;
        })
    });

    schoolMatcher.initialize();


    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'Schools',
        displayKey: function(school) {
            return school.school_name;
        },
        source: schoolMatcher.ttAdapter()
    });

    $('.typeahead').on('typeahead:selected', function(e, s) {
        // define content
        var content = _template.split("{{school_name}}").join(s.school_name)
                               .split("{{district_id}}").join(s.district_number)
                               .split("{{school_address}}").join(s.school_physical_address);

        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);

        infowindow.setContent(content);
        infowindow.latlng = latlng;
        infowindow.open(map, gmap_markers[hash_school_key(s)]);

        // TODO: clear the typeahead
        e.target.value = "";
    });

});

