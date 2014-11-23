(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni, findVel) {
      var b = 2;

      var Car = {
        init: function(n, km, wT, aT) {
          _.assign(this, {
            n: n,
            km: km,
            aT: aT,
            eT: null,
            wT: wT,
            cost: 0,
            queueing: 0,
            SP: 0,
            kmLeft: km,
            utilHome: 0,
            utilWork: 0
          });
        },
        choose: function(minutes, scale) {
          var self = this;
          var pCost = this.cost;
          minutes.forEach(function(d, i) {
            var eT = scale(d.X + self.km);
            if (eT >= Uni.numMinutes) return;
            var u = self.getCost.call({
              wT: self.wT
            }, d.t, eT);
            if (u >= pCost) {
              self.aT = d.t;
              pCost = u;
            }
          });
        },
        getCost: function(aT, eT) {
          // var res = boo ? this : {};
          this.travel_time = aT - eT;
          this.utilHome = 1 - Math.exp(-b * (aT - this.wT) / Uni.numMinutes) / b;
          this.utilWork = 1 - Math.exp(b * (eT - this.wT) / Uni.numMinutes) / b;
          return (this.cost = this.utilWork + this.utilHome);
        },
        evalCost: function() {
          this.getCost.call(this, this.aT, this.eT);

          // var a = this.wT;
          // var c = Uni.numMinutes;
          // this.travel_time = this.aT - this.eT;
          // this.utilHome = 1 - Math.exp(-b * (this.aT - a) / c) / b;
          // this.utilWork = 1 - Math.exp(b * (this.eT - a) / c) / b;
          // this.cost = this.utilHome + this.utilWork;
          // return this.cost;
        },
        place: function(minutes) {
          var M = minutes[this.aT];
          M.receive(this);
          M.arrivals++;
        }
      };
      return Car;
    });

})(window.angular)
