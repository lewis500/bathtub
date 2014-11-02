(function(angular) {
  angular
    .module('mainApp')
    .directive('ganttChart', function(Uni) {

      var link = function(scope, el, attr) {
        var margin = {
          top: 20,
          right: 15,
          bottom: 30,
          left: 35
        };

        var color = d3.scale.category20();

        var height = +attr.height;
        var y = d3.scale.ordinal().rangeBands([0, height], .2)
        var x = d3.scale.linear().domain([0, Uni.numMinutes]);
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        var tip = d3.select(".tip");

        var svg = d3.select(el[0])
          .append("svg")
          .style('width', "100%")
          .attr("height", height + margin.top + margin.bottom);

        var g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var gXAxis = g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");

        var drawn, bar;

        scope.$on('drawEvent', update);

        $(window).on('resize', render);

        render();

        function render() {
          var width = d3.select(el[0]).node().offsetWidth - margin.left - margin.right;
          x.range([0, width]);
          gXAxis.call(xAxis);

          if (drawn) update();
          else create();
        }

        function create() {
          y.domain(_.pluck(scope.cars, 'n'));

          bar = svg.selectAll('.time')
            .data(scope.cars, function(d){
              return d.n;
            })
            .enter()
            .append('rect')
            .attr('y', function(d) {
              return y(d.n);
            })
            .attr('class','time')
            .attr('fill', function(d,i){
              return color(i);
            });

        }

        function update() {
          if (!drawn) drawn = true;
          bar.data(scope.cars, function(d) {
              return d.n;
            })
            .attr({
              x: function(d) {
                return x(d.aT);
              },
              width: function(d) {
                var w = x(d.eT) - x(d.aT);
                if (w<0) w = 0;
                return w;
              },
              height: y.rangeBand()
            });

        }

      }; //end the big return

      return {
        scope: {
          cars: '=cars'
        },
        link: link
      };

    }); //end directive definition
})(window.angular);
