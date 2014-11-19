(function(angular) {

    angular.module('mainApp').directive('tollChart',
        function(Uni) {

            var link = function(scope, el, attr, ctrl) {

                var margin = {
                    top: 10,
                    right: 35,
                    bottom: 30,
                    left: 45
                };

                var width = (+attr.width) - margin.left - margin.right;
                var height = (+attr.height) - margin.top - margin.bottom;
                var numFormat = d3.format(".2r");

                var y = d3.scale.linear()
                    .domain([0, 50])
                    .range([height, 0]);

                var x = d3.scale.linear()
                    .domain([0, Uni.numMinutes])
                    .range([0, width]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                var svg = d3.select(el[0]).append("svg")
                    .attr("width", +width + margin.left + margin.right)
                    .attr("height", +height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var line = d3.svg.line()
                    .x(function(d) {
                        return x(d.t);
                    })
                    .y(function(d) {
                        return y(d.toll);
                    });

                var path = svg.append('path')
                    .attr({
                        'stroke-width': 3,
                        'stroke': 'red',
                        fill: 'none'
                    })

                var gXAxis = svg.append("g")
                    .attr("class", " x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                var gYAxis = svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

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

                    path.attr('d', line);
                }

            }; //end link

            return {
                link: link,
                scope: {
                    car: '=car',
                },
                restrict: 'A',
            };
        }); //end directive definition

})(window.angular);
