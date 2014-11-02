(function(angular) {

  angular.module('mainApp')
    .constant('Uni', {
      alpha: 1,
      beta: .5,
      gamma: 2,
      numCars: 2000,
      numMinutes: 75,
      z: .5 * 2 / (2.5)
    });

  angular.module('mainApp')
    .controller('mainCtrl', function($scope, Runner, Minute, Car, Uni) {
      var self = this;

      function rounder(d) {
        return +(Math.round(d / self.increment) * self.increment).toFixed(2);
      }

      self.increment = .01;

      self.measure = 'total';

      function makeX() {
        var res = {};
        var x = findVel(0);
        while (x < 80) {
          res[x.toFixed(2)] = 0;
          x += self.increment;
        }
        return res;
      }

      var X = makeX();

      self.init = function() {
        var n = 0;
        var w = 0;
        self.cars = linspace2(1.3, 3.3, Uni.numCars)
          .map(function(d) {
            var km = rounder(d);
            var newCar = Object.create(Car);
            var aT = _.random(0, Uni.numMinutes - 1);
            n++;
            w += km;
            newCar.init(n, km, w, 100, aT);
            return newCar;
          });

        self.sample = d3.range(200).map(function(d){
          return self.cars[d*Uni.numCars / 200];
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
      };


      self.sampleSize = 20;
      self.init();

      function tick() {
        _.invoke(self.minutes, 'serve');
        var scale = d3.scale.linear()
          .domain(_.pluck(self.minutes, 'X'))
          .range(_.pluck(self.minutes, 't'));
        _.forEach(X, function(val, key) {
          var val = rounder(scale(+key));
          X[key] = val;
        });

        var s = _.sample(self.cars, self.sampleSize);
        _.forEach(s, function(d) {
          d.choose(X);
        });
        _.invoke(s, 'makeChoice');
        self.cars.forEach(function(car) {
          car.place(self.minutes);
        });
        $scope.$broadcast('drawEvent')
      };

      var runner = Runner;
      self.ticker = runner.addRepeater('tick', tick, 100, 'pace');
      self.ticker.start();
      // self.paused = self.runner.repeaters.tick.paused;
    });

})(window.angular);

function ma(a, b) {
  return d3.max([a, b]);
}

function mi(a, b) {
  return d3.min([a, b]);
}

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

function ma(a, b) {
  return d3.max([a, b]);
}

function mi(a, b) {
  return d3.min([a, b]);
}


function findVel(u){
  return .5*(1 - 0.6*u/2000);
}
