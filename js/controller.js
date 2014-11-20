(function(angular) {

  angular.module('mainApp')
    .factory('Uni', function() {
      var Uni = {
        numCars: 5000,
        numMinutes: 150,
        beta: .5,
        gamma: 1,
        wT: 100,
        toll: 'none',
        V: 97
          // v0: .25,
      };

      // Uni.V = Uni.v0 * Uni.numCars / 4 * .7;
      return Uni;
    });

  angular.module('mainApp')
    .factory('findVel', function(Uni) {
      return function findVel(u) {
        u = 13 * u;
        if (u <= 12000) return 30.8 * Math.exp(-u * 1.405e-4) / 60;
        var v1 = 30.8 * Math.exp(-12000 * 1.405e-4) / 60;
        return Math.max(v1 - (u - 12000) * 7.1e-4 / 60, 0);
      };
    });

  angular.module('mainApp')
    .controller('mainCtrl', function($scope, Runner, Minute, Car, Uni, findVel) {
      var self = this;
      var increment = .01;
      self.measure = "queueing";
      self.whichCar = null;
      self.Car = Car;
      self.Uni = Uni;
      self.barSample = [];
      self.ganttSample = [];
      var X = linspace(0, findVel(0) * Uni.numMinutes, increment);
      var scale = d3.scale.linear();
      self.sampleSize = 25;

      self.changeCar = function(v) {
        self.whichCar = v;
        $scope.$apply();
      };

      init();

      var drawBroadcaster = _.throttle(function() {
        $scope.$broadcast('drawEvent');
        $scope.$apply();

      }, 1000);

      self.changeToll = function(v) {
        Uni.toll = v;
      };

      self.metrics = {
        cost: 0,
        toll: 0,
        SP: 0,
        queueing: 0
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
        _.forEach(X, function(val, key) {
          var val = Math.floor(scale(+key / 100));
          X[key] = val;
        });

        var s = _.sample(self.cars, self.sampleSize);
        _.forEach(s, function(d) {
          d.choose(X);
        });
        self.cars.forEach(function(car, i) {
          car.place(self.minutes);
          _.forEach(self.metrics, function(val, key) {
            if (i == 0) self.metrics[key] = 0;
            self.metrics[key] += car[key];
          });
        });

        drawBroadcaster();

      }

      function rounder(d) {
        return +(Math.round(d / increment) * increment).toFixed(2);
      }

      function init() {
        var n = 0;
        var w = 0;
        self.cars = linspace2(.5, 3, Uni.numCars)
          .map(function(d, i) {
            var km = rounder(d);
            var newCar = Object.create(Car);
            var aT = _.random(.2 * Uni.numMinutes, .8 * Uni.numMinutes);
            n++;
            w += km;
            newCar.init(n, km, w, aT);
            return newCar;
          });

        self.barSample = linspace(0, Uni.numCars - 1, 75)
          .map(function(d) {
            return self.cars[d];
          });

        self.ganttSample = linspace(0, Uni.numCars - 1, 75)
          .map(function(d) {
            return self.cars[d];
          });

        Uni.phiMax = self.cars[self.cars.length - 1].phi;

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

        self.whichCar = self.cars[self.cars.length - 1];

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
    return a + d * Q;
  });
}
