(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni) {

      var Car = {
        init: function(n, km, w, aT) {
          _.assign(this, {
            n: n,
            km: km,
            aT: aT,
            eT: null,
            poss: 0,
            cost: 0,
            kmLeft: km,
            phi: w * (Uni.beta * Uni.gamma) / (Uni.beta + Uni.gamma) / Uni.V,
          });
        },
        tollType: 'none',
        choose: function(X) {
          var self = this;
          var pCost = this.cost;
          _.forEach(X, function(aT, x) {
            var d = Math.round(x + self.km * 100);
            var eT = Math.floor(X[d]);
            var u = self.getCost.apply(self, [aT, eT]);
            if (eT >= Uni.numMinutes) return false;
            if (u < pCost) {
              self.poss = aT;
              pCost = u;
            }
          });
        },
        getToll: {
          distance: function(SP, phi) {
            return Math.max(phi - SP, 0);
          },
          trip: function(SP) {
            return Math.max(Uni.phiMax - SP, 0);
          },
          none: function(eT) {
            return 0;
          }
        },
        makeChoice: function() {
          this.aT = this.poss;
        },
        getCost: function(aT, eT) {
          var SD = (eT - Uni.wT);
          var SP = Math.max(-Uni.beta * SD, Uni.gamma * SD);
          return SP + (eT - aT) + this.getToll[this.tollType](SP, this.phi);
        },
        evalCost: function() {
          var SD = (this.eT - Uni.wT);
          this.SP = Math.max(-Uni.beta * SD, Uni.gamma * SD);
          this.toll = this.getToll[this.tollType](this.SP, this.phi);
          this.queueing = this.eT - this.aT;
          this.cost = this.toll + this.SP + this.queueing;
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
