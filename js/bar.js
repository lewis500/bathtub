(function(angular) {

  angular.module('mainApp').directive('barChart',
    function(Uni) {

      var link = function(scope, el, attr, ctrl) {

        var margin = {
          top: 10,
          right: 35,
          bottom: 10,
          left: 45
        };

        var width = (+attr.width) - margin.left - margin.right;
        var height = (+attr.height) - margin.top - margin.bottom;
        var numFormat = d3.format(".2r");

        var y = d3.scale.linear()
          .range([height, 0]);

        var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .2);

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(0)
          .tickFormat(function(d) {
            return null;
          });

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

        var tip = d3.select(".tip");

        var svg = d3.select(el[0]).append("svg")
          .attr("width", +width + margin.left + margin.right)
          .attr("height", +height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function mouseoverFunc(d) {
          scope.$apply(function() {
            scope.info = d.cost;
          });
        }

        var gXAxis = svg.append("g")
          .attr("class", " x axis")
          .attr("transform", "translate(0," + height + ")");

        var gYAxis = svg.append("g")
          .attr("class", "y axis");

        scope.$on('drawEvent', draw);

        function draw() {
          var data = scope.cars;

          var measure = scope.measure;
          if (!data) return;
          if (x.domain().length == 0) {
            x.domain(data.map(function(d) {
              return d.phi;
            }));
            gXAxis.call(xAxis);
          }

          var b = d3.extent(data, function(d) {
            return d[measure]
          });

          y.domain(b);

          gYAxis
            .call(yAxis);

          var bar = svg.selectAll(".bar")
            .data(data, function(d) {
              return d.n;
            });

          bar.enter()
            .append("rect")
            .attr("class", "bar");

          bar.on({
            // mouseover: mouseoverFunc,
            click: scope.changeCar
          });

          bar
          // .transition()
          // .duration(150)
          // .ease('linear')
          // .delay(function(d, i) {
          //   return 1 * i;
          // })
            .attr("x", function(d) {
              return x(d.phi);
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
              return y(d[measure]);
            })
            .attr("height", function(d) {
              return height - y(d[measure]);
            });
        }

      }; //end link

      return {
        link: link,
        scope: {
          cars: '=cars',
          measure: '=measure',
          changeCar: "=changeCar"
        },
        // templateUrl: function(el, attr) {
        //   return attr.tipUrl;
        // },
        restrict: 'A',
        // controller: function($scope) {
        //   $scope.info = {
        //     travel_cost: 0,
        //     schedule_cost: 0,
        //     toll: 0,
        //     total: 0
        //   };
        // }
      };
    }); //end directive definition

})(window.angular);
