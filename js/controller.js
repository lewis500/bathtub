(function(angular) {

  angular.module('mainApp')
    .constant('Uni', {
      numCars: 250,
      numMinutes: 150,
      V: 7,
      beta: .5,
      gamma: 2,
      wT: 100,
      toll: 'none'
    });

  angular.module('mainApp')
    .controller('mainCtrl', function($scope, Runner, Minute, Car, Uni) {
      var self = this;

      function rounder(d) {
        return +(Math.round(d / self.increment) * self.increment).toFixed(2);
      }

      self.increment = .01;

      self.measure = "queueing";
      self.whichCar = null;
      self.Car = Car;

      self.changeCar = function(v) {
        self.whichCar = v;
        $scope.$apply();
        // $scope.$broadcast('carSelect');
      };

      self.barSample = [];
      self.ganttSample = [];

      var X = (function makeX() {
        var res = {};
        var x = findVel(0) + self.increment;
        while (x <= findVel(0) * Uni.numMinutes) {
          res[+x.toPrecision(2)] = 0;
          x += self.increment;
        }
        return res;
      })();

      // tick.scale = d3.scale.linear();
      var scale = d3.scale.linear();

      self.init = function() {
        var n = 0;
        var w = 0;
        self.cars = linspace2(.5, 3, Uni.numCars)
          .map(function(d, i) {
            var km = rounder(d);
            var newCar = Object.create(Car);
            var aT = _.random(0, Uni.numMinutes - 1);
            n++;
            w += km;
            newCar.init(n, km, w, aT);
            if (i % 5 === 0) self.barSample.push(newCar);
            if (i % 3 === 0) self.ganttSample.push(newCar);
            return newCar;
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
      };

      self.sampleSize = 5;
      self.init();

      function tick() {
        _.invoke(self.minutes, 'serve');
        var dom = [],
          ran = [];
        _.forEach(self.minutes, function(m) {
          dom.push(m.X);
          ran.push(m.t);
        });
        scale.domain(dom).range(ran);

        // .domain(_.pluck(self.minutes, 'X'))
        // .range(_.pluck(self.minutes, 't'));
        _.forEach(X, function(val, key) {
          var val = Math.floor(scale(+key));
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

        drawBroadcaster();
      }

      var drawBroadcaster = _.throttle(function() {
        $scope.$broadcast('drawEvent')

      }, 1000);

      self.changeToll = function(v) {
        Uni.toll = v;
      };

      var runner = Runner;
      self.ticker = runner.addRepeater('tick', tick, 50, 'pace');
      self.ticker.start();
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


function findVel(u) {
  return .13 * (1.0 - (Math.max(u / 250, .2)));
}
