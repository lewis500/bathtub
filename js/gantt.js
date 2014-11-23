(function(angular) {
  angular
    .module('mainApp')
    .directive('ganttChart', function(Uni) {

      var link = function(scope, el, attr) {
        var margin = {
          top: 0,
          right: 15,
          bottom: 30,
          left: 35
        };

        var colorScale = d3.scale.linear() //function that takes numbers & returns colors
          .range(["blue", "yellow"]) //the color range
          .interpolate(d3.interpolateHcl); //how to fill the inbetween colors

        var height = +attr.height;
        var y = d3.scale.ordinal().rangeBands([0, height], .1)
        var x = d3.scale.linear().domain([0, Uni.numMinutes]);
        var x2 = d3.scale.linear();

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        var tip = d3.select(".tip");

        var svg = d3.select(el[0])
          .append("svg")
          .style('width', "100%")
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bg = svg.append('rect')
          .attr('height', height)
          .attr('fill', '#222');

        var bg2 = svg.append('rect')
          .attr('height', height)
          .attr('fill', '#222');

        var sep = svg.append('line')
          .attr({
            y1: 0,
            y2: height,
            stroke: 'white',
            'stroke-width': 2,
            'stroke-dasharray': '2 , 2'
          });
        // .attr('transform', 'translate(')

        var both;

        var rg = svg.append('g').attr('class', 'g-bar');

        var gXAxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");

        var drawn, bar, bar2, bar1;

        var timeLine = svg.append('line')
          .attr({
            y1: 0,
            y2: height,
            opacity: 0,
            stroke: 'white',
            fill: 'none',
            'stroke-width': '2px',
            'stroke-dasharray': '2, 2'
          });

        scope.$watch('timeLine', function() {
          timeLine.attr('transform', 'translate(' + [x(scope.timeLine), 0] + ')')
        });

        scope.$watch('cars.length', function() {
          if (!scope.cars) return;
          y.domain(d3.range(0, scope.cars.length));
          colorScale.domain(d3.extent(y.domain())); //domain of input data 1 to 38

          bar = rg.selectAll('.time')
            .data(scope.cars, function(d) {
              return d.n;
            });

          bar1 = bar.enter()
            .append('rect')
            .attr('y', function(d, i) {
              return y(i);
            })
            .attr('class', 'time')
            .attr('fill', function(d, i) {
              return colorScale(i);
            })
            .attr('height', y.rangeBand())
            .on({
              'mouseover': function(d) {
                both.classed('highlighted', function(v) {
                  return d.wT == v.wT;
                });
                both.classed('dehighlighted', function(v) {
                  return d.wT !== v.wT;
                });
                timeLine.attr('transform', 'translate(' + [x(d.wT), 0] + ')')
                  .attr('opacity', 1);

                scope.$apply(function() {
                  scope.timeLine = d.wT;
                });

              },
              'mouseout': function(d) {
                both.classed('highlighted', false)
                both.classed('dehighlighted', false);
                timeLine.attr('opacity', 0);
              }
            });

          bar2 = bar.enter()
            .append('rect')
            .attr({
              y: function(d, i) {
                return y(i);
              },
              fill: function(d, i) {
                return colorScale(i);
              },
              class: 'time',
              height: y.rangeBand()
            });

          both = d3.selectAll('rect.time')

        });

        scope.$on('drawEvent', update);

        $(window).on('resize', render);

        render();

        function render() {
          var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
          var w1 = width * .75;
          x.range([0, w1]);
          x2.range([0, width - w1]);
          gXAxis.call(xAxis);
          bg.attr('width', w1);
          bg2.attr('width', width - w1);
          bg2.attr('transform', 'translate(' + [w1, 0] + ')');
          sep.attr({
            x1: w1,
            x2: w1
          });
          if (drawn) update();
        }

        function update() {
          if (!drawn) drawn = true;
          bar1.data(scope.cars, function(d) {
              return d.n;
            })
            .transition()
            .ease('linear')
            .attr({
              x: function(d) {
                return x(d.aT);
              },
              width: function(d) {
                var w = x(d.eT) - x(d.aT);
                if (w < 0) w = 0;
                return w;
              },
              height: y.rangeBand()
            });

          var b = d3.extent(scope.cars, function(d) {
            return -d[scope.measure]
          })

          x2.domain(b);

          bar2.data(scope.cars, function(d) {
              return d.n;
            })
            .transition()
            .delay(function(d, i) {
              return i
            })
            .attr({
              width: function(d) {
                var a = x2(-d[scope.measure]);
                return a;
              },
              x: x.range()[1]
            });

        }

      }; //end the big return

      return {
        scope: {
          cars: '=cars',
          measure: '=measure',
          timeLine: '=timeLine'
        },
        link: link
      };

    }); //end directive definition
})(window.angular);
