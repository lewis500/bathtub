(function(angular) {

  angular.module('mainApp')
    .factory('Uni', function() {
      var Uni = {
        numCars: 2000,
        numMinutes: 160,
      };

      return Uni;
    });

  angular.module('mainApp')
    .factory('findVel', function(Uni) {
      return function findVel(u) {
        // u = u;
        return .5*(1 - .35*u / Uni.numCars);
        // return 30.8 * Math.exp(-u / 2 * 1.405e-4) / 60;
      };
    });

  angular.module('mainApp')
    .controller('mainCtrl', function($scope, Runner, Minute, Car, Uni, findVel) {
      var self = this;
      // var increment = .01;
      self.measure = "utilHome";
      self.Car = Car;
      self.Uni = Uni;
      self.barSample = [];
      self.ganttSample = [];
      self.timeLine = 0;
      var scale = d3.scale.linear();
      self.sampleSize = 25;
      init();

      var drawBroadcaster = _.throttle(function() {
        $scope.$broadcast('drawEvent');
        $scope.$apply();
      }, 1000);

      self.metrics = {
        utilHome: 0,
        utilWork: 0,
        travel_time: 0,
        cost: 0
      };

      function tick() {
        _.invoke(self.minutes, 'serve');
        var dom = [],
          ran = [];
        _.forEach(self.minutes, function(m) {
          dom.push(m.X);
          ran.push(m.t);
        });
        scale.domain(dom).range(ran);

        var s = _.sample(self.cars, self.sampleSize);
        _.forEach(s, function(d) {
          d.choose(self.minutes, scale);
        });
        self.cars.forEach(function(car, i) {
          car.place(self.minutes);
          _.forEach(self.metrics, function(val, key) {
            if (i == 0) self.metrics[key] = 0;
            self.metrics[key] += car[key] / Uni.numCars;
          });
        });

        drawBroadcaster();

      }

      function init() {
        var n = 0;
        var w = 0;
        var times = [75,80,85]
        self.cars = linspace3(8, 30, Uni.numCars)
          .map(function(d, i) {
            var km = d;
            var newCar = Object.create(Car);
            var aT = _.random(.3 * Uni.numMinutes, .6 * Uni.numMinutes);
            n++;
            w += km;
            var wT = _.sample(times, 1)[0];
            newCar.init(n, km, wT, aT);
            return newCar;
          });

        self.barSample = linspace(0, Uni.numCars - 1, 75)
          .map(function(d) {
            return self.cars[d];
          });

        self.ganttSample = linspace2(0, Uni.numCars - 1, 200)
          .map(function(d) {
            return self.cars[d];
          });

        self.minutes = d3.range(0, Uni.numMinutes)
          .map(function(t) {
            var newMinute = Object.create(Minute);
            newMinute.init(t);
            return newMinute;
          });
        self.minutes.forEach(function(d, i, k) {
          if (i > 0) d.prev = k[i - 1];
          if (i < k.length - 1) d.next = k[i + 1];
        });

        var runner = Runner;
        self.ticker = runner.addRepeater('tick', tick, 50, 'pace');
        self.ticker.start();

      }

    });

})(window.angular);

function linspace(a, b, precision) {
  var c = 1.0 / precision;
  a = a * c;
  b = b * c;
  return d3.range(a, b).map(function(d) {
    return d * precision;
  });
}

function linspace2(a, b, n) {
  var Q = (b - a) / n;
  return _.range(0, n + 1).map(function(d) {
    return Math.floor(a + d * Q);
  });
}

function linspace3(a, b, n) {
  var Q = (b - a) / n;
  return _.range(0, n + 1).map(function(d) {
    return a + d * Q;
  });
}
