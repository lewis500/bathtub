(function(angular) {

  angular.module('mainApp')
    .directive('lineChart',
      function(Uni) {

        var link = function(scope, el, attr) {
          var margin = {
            top: 20,
            right: 15,
            bottom: 30,
            left: 50
          };

          var height = +attr.height;
          var y = d3.scale.linear().range([height, 0]).domain([0, Uni.numCars]);
          var x = d3.scale.linear().domain([0, Uni.numMinutes]);
          var color = d3.scale.category10();
          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

          var y2 = d3.scale.linear()
            .domain([0, 50])
            .range([height, 0]);

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

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

          var path = g.append('path')
            .attr({
              'stroke-width': 3,
              'stroke': 'red',
              fill: 'none'
            })

          scope.$watch('car', draw);


          function draw() {
            var c = scope.car;
            if (!c) return;
            var data = d3.range(Uni.numMinutes)
              .map(function(d) {
                var SD = d - Uni.wT;
                var SP = Math.max(-Uni.beta * SD, Uni.gamma * SD);
                return {
                  t: d,
                  toll: c.getToll[c.tollType](SP, c.phi)
                };
              });

            path.datum(data);

            path.attr('d', line3);
          }




          // bg.on('mousemove', mousemove)
          //   .on('mouseout', mouseoutFunc);

          // function mousemove() {
          //   var u = _.find(scope.minutes, function(v) {
          //     var e = x.invert(d3.mouse(this)[0]);
          //     return v.time >= e;
          //   }, this);

          //   scope.$apply(function() {
          //     scope.param.info = u;
          //   });
          //   tip.style("opacity", .9)
          //     .style("left", (d3.event.pageX) + "px")
          //     .style("top", (d3.event.pageY - 150) + "px");
          // }

          // function mouseoutFunc(d) {
          //   tip.style("opacity", 0);
          // }

          var gXAxis = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

          var xAxisText = gXAxis.append("text")
            .attr("y", -15)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("time");

          var gYAxis = g.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("cumulative veh");

          var myLine = g.append("path")
            .attr("class", "line")
            .attr("stroke-width", "2px")
            .attr("stroke", "black");

          var myLine2 = g.append("path")
            .attr("class", "line")
            .attr("stroke-width", "2px")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke", "black");

          var line3 = d3.svg.line()
            .x(function(d) {
              return x(d.t);
            })
            .y(function(d) {
              return y2(d.toll);
            });

          var drawn;

          scope.$on('drawEvent', update);

          $(window).on('resize', render);

          render();

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

            myLine.datum(scope.minutes)
              .transition()
              // .ease('linear')
              .attr("d", line);

            myLine2.datum(scope.minutes)
              .transition()
              // .ease('linear')
              .attr("d", line2);

          }

        }; //end the big return

        return {
          scope: {
            minutes: '=minutes',
            car: '=car',
            // params: '=params'
          },
          link: link
        };

      }
    ); //end directive definition

})(window.angular);
