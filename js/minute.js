(function(angular) {
  angular.module('mainApp')
    .factory('Minute', function(Uni) {
      var Minute = {};

      Minute.serve = function() {
        var Q = this.queue;
        var self = this;
        this.vel = findVel(Q.length);
        var numE = 0;
        _.forEach(Q, function(car) {
          car.kmLeft = car.kmLeft - self.vel;
          if (car.kmLeft <= 0 || !self.next) {
            numE++;
            car.eT = self.t;
            car.kmLeft = car.km;
            car.evalCost();
          } else self.next.receive(car);
        });
        this.cumE = numE;
        this.cumA = this.arrivals;
        this.X = this.vel;
        this.queue = [];
        this.arrivals = 0;

        var prev = this.prev;
        if (!prev) return;
        this.cumE += prev.cumE;
        this.cumA += prev.cumA;
        this.X += prev.X;
      };

      Minute.receive = function(car) {
        this.queue.push(car);
      };

      Minute.init = function(t) {
        _.assign(this, {
          t: t,
          X: 0,
          next: null,
          prev: null,
          arrivals: 0,
          vel: findVel(0),
          cumA: 0,
          cumE: 0,
          queue: []
        });
      };

      return Minute;
    });



})(window.angular);
