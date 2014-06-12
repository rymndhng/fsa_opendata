/* global Handlebars, Ractive */
var chartData = {};
var districts;
var schools;


function drawError(msg) {
    var template = Handlebars.compile("<div class='alert alert-warning'>{{msg}}</div>");
    var content = $(template({msg: msg}));
    $("#notification-console").append(content);
    setTimeout(function() {
        content.fadeOut(500, function() { $(this).remove();});
    }, 1000);
}

function addData(data) {
    if (data.length == 0) {
        drawError("Selected school does not have any FSA scores in this period");
    }
    for (var i=0; i < data.length; i++) {
        if (!chartData[data[i].key]) {
            selectedSchools.push(data[i].key);
            chartData[data[i].key] = data[i];
        }
    }
}


var chart;

nv.addGraph(function() {

    chart = nv.models.lineChart()
        .margin({left: 25})
        .useInteractiveGuideline(true)
        .showLegend(false)
        .showYAxis(true);

    chart.xAxis
        .axisLabel('School Year')
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


function drawChart() {
    d3.select('#chart svg')
        .datum(_.values(chartData))
        .transition().duration(500)
        .call(chart);
}



function parseToXY(response) {
      var formattedData;
      var data = {};
      var schools = [];

      schools = _.chain(response)
          .map(function(elem) {
              return elem.school_name;
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
              });
      });

      formattedData = _.map(data, function(v, k) {
          return { key: k, values: v };
      });

      return formattedData;
}

// ------------- Setup Google Maps
var mapOptions = {
    center: new google.maps.LatLng(49.2515436,-123.1049354),
    zoom: 12,
    scrollwheel: false
};

var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

// contains our constant lookup schools to neighborhoods
var neighborhoodToSchools = {};
var polygonDeferred = $.Deferred();
var schoolsDeferred = $.Deferred();
$.when(polygonDeferred, schoolsDeferred).then(function (polygons, schools) {
    // setup the polygons
    polygons.forEach(function (polygon) {
        neighborhoodToSchools[polygon.title] = {
            schools: [],
            polygon: polygon
        };
    });

    var vancouverSchools = _.where(schools, {"district_number": 39});

    var neighborhoodPairs = _.pairs(neighborhoodToSchools);
    vancouverSchools.forEach(function(s) {
        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);
        var neighborhood = _.find(neighborhoodPairs, function(pair) {
            return google.maps.geometry.poly.containsLocation(latlng, pair[1].polygon);
        });
        !!neighborhood && neighborhood[1].schools.push(s);
    });
});


// parse templates
var templates = {
    infowindow: {
        neighborhood: Handlebars.compile($('#neighborhood-infowindow').html()),
        school: Handlebars.compile($("#school-infowindow").html())
    }
};


// ---------------- Adding Neighborhood Information
function useTheData(documents) {
    // parse all the document data
    documents.forEach(function(doc) {

       // TODO: resolve should only be called once.
       polygonDeferred.resolve(doc.gpolygons);

       // Adding event listeners for each polygon
       doc.gpolygons.forEach(function (polygon) {
           
           google.maps.event.addListener(polygon, 'click', function(elem) {
               var context = {
                   name: polygon.title,
                   schools: _.pluck(neighborhoodToSchools[polygon.title].schools, "school_name")
               };

               infowindow.setContent(templates.infowindow.neighborhood(context));
               infowindow.latlng = elem.latLng;
               infowindow.open(map);
           });

       });
    });
}

var infowindow = new google.maps.InfoWindow({});
var geoXml = new geoXML3.parser({
    map: map,
    zoom: false,
    singleInfoWindow: true,
    infoWindow: infowindow,
    processStyles: true,
    afterParse: useTheData
});

geoXml.parse('/static/cov_localareas.kml');

function addSchool(district_id, school_name) {
    d3.json("data?district_id="+district_id+"&school_name="+school_name, function (resp) {
        addData(parseToXY(resp));
        drawChart();
    });
}

// --------------- Event Handlers 
$('#map-canvas').on('click', '.add-neighborhood', function(e) {
    var neighborhood_name = e.target.value;
    neighborhoodToSchools[neighborhood_name].schools.forEach(function(school) {
        addSchool(school.district_number, school.school_name);
    });
});

$('#map-canvas').on('click', '.add-school', function(e) {
    var district_id, school_name;
    results = e.target.value.split(":");
    district_id = results[0];
    school_name = results[1];
    addSchool(district_id, school_name);
});


d3.json("schools", function(resp) {
    function hash_school_key(school) {
        return [school.district_number, school.school_name].join(":");
    }

    // map of points to lookup from infobox by schoolname & id
    var gmap_markers = {};

    // ----------------- LOAD MAPS VIS

    schoolsDeferred.resolve(resp);
    resp.forEach(function(s) {

        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);
        var marker = new google.maps.Marker({
            position: latlng,
            title: s.school_name,
            icon: "/static/school.png"
        });
        marker.setMap(map);

        // store this in lookups
        gmap_markers[hash_school_key(s)] = marker;
            
        google.maps.event.addListener(marker, 'click', function() {
            var context = {
                school_name: s.school_name,
                school_address: s.school_physical_address,
                district_id: s.district_number
            }; 

            infowindow.setContent(templates.infowindow.school(context));
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
        var context = {
            school_name: s.school_name,
            school_address: s.school_physical_address,
            district_id: s.district_number
        }; 
        
        var latlng = new google.maps.LatLng(s.school_latitude, s.school_longitude);

        infowindow.setContent(templates.infowindow.school(context));
        infowindow.latlng = latlng;
        infowindow.open(map, gmap_markers[hash_school_key(s)]);

        // TODO: clear the typeahead
        e.target.value = "";
    });


});


//======================================================================
// bring things to life using ractive.js
//----------------------------------------------------------------------

var selectedSchools = _.chain(chartData).values().pluck("key").value();

var schoolsSelected = new Ractive({
    el: "#school-selected",
    template: "#current-schools",
    data: {
        schools: selectedSchools,
        color: nv.utils.defaultColor()
    }
});

schoolsSelected.on({
    removeEntry: function(event, index) {
        selectedSchools.splice(index, 1);
        // sync this with the graph
        chartData = _.pick(chartData, selectedSchools);
        drawChart();
    },
});

// A little hack to get Vancouver averages on the list
(function() {
    var van_data = parseToXY(vancouver_data);
    van_data[0].key = "Vancouver District Average";
    addData(van_data);
    // draw the initial empty chart
})();

