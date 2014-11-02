(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni) {
      var Car = {
        init: function(n, km, aT) {
          _.assign(this, {
            n: n,
            km: km,
            aT: aT,
            eT: null,
            poss: 0,
            kmLeft: km,
            utility: 0
          });
        },
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
        getUtility: function(aT, eT) {
          var a = Uni.numMinutes/2;
          var b = 2;
          var c = Uni.numMinutes;
          var timeAtHome = -e(b * -(aT-a)/c) / b;
          var timeAtWork = -e(b * (eT-a)/c) / b;
          return timeAtWork + timeAtHome;
        },
        setUtility: function() {
          this.utility = this.getUtility(this.aT, this.eT);
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
