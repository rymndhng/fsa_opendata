//Format A
var chart;
nv.addGraph(function() {
    chart = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .useVoronoi(true)
        .color(d3.scale.category10().range())
        .transitionDuration(300);

    chart.xAxis.tickFormat(function(d) {
        return labelValues[d];
    });

    chart.xAxis.tickFormat(d3.format('.02f'));
    //.axisLabel('Year');

    chart.yAxis.tickFormat(d3.format('.02f'));
    //            .axisLabel('FSA Numeracy Score');

    chart.tooltipContent(function(key, x, y, e, graph) {
        return '<h2>' + key + ':' + e.point.year + '</h2>';
    });

    nv.utils.windowResize(chart.update);

    $.ajax({
        url: 'data_scatter.json',
        success: function(response) {
            d3.select('#test1 svg')
            //.datum(notSoRandomData(2,3))
            .datum(massage(response))
                .call(chart);
        }
    });

    d3.select('path').on('click', function() {
        return "aha";
    });

    return chart;
});

function extract_data(elem) {
    return {
        school: elem.school_name,
        code: elem.fsa_skill_code,
        year: elem.school_year.split("/")[0],
        score: elem.score,
        size: elem.participation_rate / 10
    };
}

function default_point(i, year) {
    var shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'];
    return {
        year: year,
        shape: shapes[i % shapes.length]
    }
}

function massage(response) {
    sorted_by_school = _.reduce(response, function(accum, elem) {
        accum[elem.school_name] = accum[elem.school_name] || [];
        accum[elem.school_name].push(extract_data(elem));
        return accum;
    }, {});

    return _.map(sorted_by_school, function(elems) {
        var school_result = {
            key: elems[0].school,
            values: []
        }

        school_result.values = _.chain(elems)
            .groupBy(function(elem) { return elem.year })
            .pairs()
            .map(function(pairs) {
                // pairs[0] -> year, pairs[1] -> each data point
                return _.reduce(pairs[1], function(accum, elem) {
                    var key = (elem.code == "Numeracy") ? "x" : "y";
                    accum[key] = elem.score;
                    accum.size = elem.size;
                    accum.year = elem.year;
                    return accum;
                }, {});
            })
            .filter(function(elem) {
                return !!elem.x && !! elem.y
            })
            .value();
        return school_result;
    });
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
