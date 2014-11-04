(function(angular) {

  angular.module('mainApp')
    .constant('Uni', {
      numCars: 250,
      numMinutes: 100,
    });

  angular.module('mainApp')
    .controller('mainCtrl', function($scope, Runner, Minute, Car, Uni) {
      var self = this;

      function rounder(d) {
        return +(Math.round(d / self.increment) * self.increment).toFixed(2);
      }

      self.increment = .01;

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

      var samples = d3.range(0,20)
        .map(function(d){
          return [];
        });

      var which = 0;

      self.init = function() {
        var n = 0;
        var w = 0;
        // var times = d3.range(10)
        self.cars = linspace2(.5, 6, Uni.numCars)
          .map(function(d) {
            var km = rounder(d);
            var newCar = Object.create(Car);
            // var wT = _.random(0,3) * Math.floor(Math.random()*Uni.numMinutes * .1) + Math.floor(Uni.numMinutes * .4);
            var wT = 45;
            var aT = _.random(0, Uni.numMinutes - 1);
            n++;
            w += km;
            newCar.init(n, km, aT,wT);
            _.sample(samples,1)[0].push(newCar);
            return newCar;
          });

        self.sample = d3.range(250).map(function(d){
          return self.cars[d*Uni.numCars / 250];
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


      self.sampleSize = 5;
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
        var s = samples[which];
        which = (which + 1)%samples.length;
        // var s = _.sample(samples,1)[0];
        // var s = _.sample(self.cars, self.sampleSize);
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
      self.ticker = runner.addRepeater('tick', tick, 50, 'pace');
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
  return .13*(1.0 - 0.2*(ma(u/250, .2)));
}

function e(v){
  return Math.exp(v);
}
