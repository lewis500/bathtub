(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni) {

      var getToll = {
        distance: function(SP) {
          return this.phi - SP;
        },
        trip: function(SP) {
          return this.phiMax - SP;
        },
        none: function(eT) {
          return 0;
        }
      };

      var Car = {
        init: function(n, km, aT, wT) {
          _.assign(this, {
            n: n,
            km: km,
            aT: aT,
            eT: null,
            poss: 0,
            kmLeft: km,
            utility: 0,
            wT: wT
          });
        },
        setToll: function(v) {
          this.toll = v;
        },
        toll: 'none',
        choose: function(X) {
          var self = this;
          var pUtil = this.utility;
          _.forEach(X, function(t, x) {
            var aT = Math.floor(t);
            var eT = Math.floor(X[(+x) + self.km]);
            if (eT >= Uni.numMinutes) return false;
            var u = self.getUtility(aT, eT);
            if (u > pUtil) {
              self.poss = aT;
              pUtil = u;
            }
          });
        },
        makeChoice: function() {
          this.aT = this.poss;
        },
        SP: function(eT) {

        },
        getUtility: function(aT, eT) {
          var SP = max(-Uni.beta * (eT - Uni.wT), Uni.gamma * (eT - Uni.wT));
          return SP + Uni.alpha * (eT - aT) + getToll[this.toll].call(this, SP);
        },
        setUtility: function() {
          this.utility = this.getUtility(this.aT, this.eT);
        },
        place: function(minutes) {
          var M = minutes[this.aT];
          M.receive(this);
          M.arrivals++;
        },
        setToll: function(val) {
          if (val === "vickrey") {
            getToll =
          } else {
            getToll = function() {
              return 0;
            };
          }

        }
      };
      return Car;
    });

})(window.angular)
