(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni, findVel) {

      var Car = {
        init: function(n, km, w, aT) {
          _.assign(this, {
            n: n,
            km: km,
            aT: aT,
            eT: null,
            // poss: Uni.wT,
            cost: 0,
            queueing: 0,
            toll: 0,
            SP: 0,
            kmLeft: km,
            phi: w * (Uni.beta * Uni.gamma) / (Uni.beta + Uni.gamma),
          });
        },
        tollType: 'trip',
        choose: function(X) {
          var self = this;
          var pCost = this.cost;
          _.forEach(X, function(aT, x) {
            var d = Math.round(x + self.km * 100);
            var eT = Math.floor(X[d]);
            if (eT >= Uni.numMinutes) return false;
            var u = self.getCost(aT, eT);
            if (u < pCost) {
              self.aT = aT;
              pCost = u;
            }
          }, self);
        },
        getToll: {
          distance: function(SP) {
            return Math.max(this.phi / Uni.V - SP, 0);
          },
          trip: function(SP) {
            return Math.max(Uni.phiMax / Uni.V - SP, 0);
          },
          none: function(eT) {
            return 0;
          }
        },
        getCost: function(aT, eT) {
          var SD = (eT - Uni.wT);
          var SP = SD <= 0 ? -Uni.beta * SD : Uni.gamma * SD;
          return SP + (eT - aT) + this.getToll[this.tollType].call(this, SP);
        },
        evalCost: function() {
          var SD = (this.eT - Uni.wT);
          this.SP = Math.max(-Uni.beta * SD, Uni.gamma * SD);
          this.toll = this.getToll[this.tollType].call(this, this.SP);
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
