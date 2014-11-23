(function(angular) {

  angular.module('mainApp')
    .directive('lineChart',
      function(Uni, Car, findVel) {

        var link = function(scope, el, attr) {
          var margin = {
            top: 20,
            right: 35,
            bottom: 30,
            left: 50
          };

          var tip = d3.select(".tip");

          var height = +attr.height;
          var y = d3.scale.linear().range([height, 0]).domain([0, Uni.numCars]);
          var x = d3.scale.linear().domain([0, Uni.numMinutes]);
          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

          // var y2 = d3.scale.linear()
          //   .domain([0, 50])
          //   .range([height, 0]);

          var y3 = d3.scale.linear()
            .domain([0, findVel(0)])
            .range([height, 0]);

          var line = d3.svg.line()
            .x(function(d) {
              return x(d.t);
            })
            .y(function(d) {
              return y(d.cumE);
            });

          var line2 = d3.svg.line()
            .x(function(d) {
              return x(d.t);
            })
            .y(function(d) {
              return y(d.cumA);
            });

          // var line3 = d3.svg.line()
          //   .x(function(d) {
          //     return x(d.t);
          //   })
          //   .y(function(d) {
          //     return y2(d.toll);
          //   });

          var lineSpeed = d3.svg.line()
            .x(function(d) {
              return x(d.t);
            })
            .y(function(d) {
              return y3(d.vel);
            });



          var tip = d3.select(".tip");

          var svg = d3.select(el[0])
            .append("svg")
            .style('width', "100%")
            .attr("height", height + margin.top + margin.bottom);

          var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var bg = svg.append("rect")
            .attr({
              height: height,
              opacity: 0
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var timeLine = g.append('line')
            .attr({
              y1: 0,
              y2: height,
              // opacity: 0,
              stroke: 'black',
              fill: 'none',
              'stroke-width': '2px',
              'stroke-dasharray': '3, 3, 1'
            });

          var tollLine = g.append('path')
            .attr({
              'stroke-width': 3,
              'stroke': 'red',
              fill: 'none'
            });

          var gXAxis = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

          var xAxisText = gXAxis.append("text")
            .attr({
              y: -15,
              dy: '.71em',
              'text-anchor': 'end'
            })
            .text("time");

          var gYAxis = g.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr({
              transform: "rotate(-90)",
              y: 6,
              dy: '.71em',
              'text-anchor': 'end'
            })
            .text("cumulative veh");

          var exitLine = g.append("path")
            .attr("class", "line exit");

          var arrLine = g.append("path")
            .attr("class", "line arrival");

          var velLine = g.append('path')
            .attr('class', 'line vel');

          var drawn;

          // scope.$watch('car', drawToll);
          // scope.$watch(function() {
          //   return Uni.V;
          // }, drawToll);
          // scope.$watch(function() {
          //   return Car.tollType;
          // }, drawToll);

          scope.$watch('timeLine', function() {
            timeLine.transition().attr('transform', 'translate(' + [x(scope.timeLine), 0] + ')')
          });

          scope.$on('drawEvent', update);

          $(window).on('resize', render);

          render();

          // function drawToll() {
          //   var c = scope.car;
          //   if (!c) return;
          //   var data = d3.range(Uni.numMinutes)
          //     .map(function(d) {
          //       var SD = d - Uni.wT;
          //       var SP = Math.max(-Uni.beta * SD, Uni.gamma * SD);
          //       return {
          //         t: d,
          //         toll: c.getToll[c.tollType].call(c, SP)
          //       };
          //     });

          //   tollLine.datum(data);

          //   tollLine.attr('d', line3);
          // }

          bg.on('mousemove', mousemove)
            .on('mouseout', mouseoutFunc);

          function mousemove() {
            var e = x.invert(d3.mouse(this)[0]);
            var u = _.find(scope.minutes, function(v) {
              return v.t >= e;
            });

            scope.$apply(function() {
              scope.info = u;
            });

            tip.style("opacity", .9)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 150) + "px");
          }

          function mouseoutFunc(d) {
            tip.style("opacity", 0);
          }

          function render() {
            var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
            x.range([0, width]);
            gXAxis.call(xAxis);
            xAxisText.attr("transform", "translate(" + [width - 5, 0] + ")");

            bg.attr("width", width);

            if (drawn) update();
          }

          function update() {
            if (!drawn) drawn = true;

            exitLine.datum(scope.minutes)
              .transition()
              .ease('linear')
              .attr("d", line);

            arrLine.datum(scope.minutes)
              .transition()
              .ease('linear')
              .attr("d", line2);

            velLine.datum(scope.minutes)
              .transition()
              .ease('linear')
              .attr('d', lineSpeed);

          }

        }; //end the big return

        return {
          scope: {
            minutes: '=minutes',
            car: '=car',
            info: '=info',
            timeLine: '=timeLine'
          },
          link: link,
          templateUrl: 'tooltip.html'
        };

      }
    ); //end directive definition

})(window.angular);
