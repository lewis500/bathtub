(function() {
  angular.module('mainApp')
    .factory('Car', function(Uni) {
      var Car = {
        init: function(n, km, w, wT, aT) {
          _.assign(this, {
            w: w,
            n: n,
            km: km,
            phi: Uni.z * w,
            aT: aT,
            eT: null,
            wT: wT,
            poss: 0,
            kmLeft: km,
            cost: {
              travel_cost: 0,
              schedule_cost: 0,
              toll: 0,
              total: 0
            }
          });
        },
        choose: function(X) {
          var self = this;
          var pCost = this.cost.total;
          _.forEach(X, function(t, x) {
            var eT = Math.floor(X[(+x) + self.km]);
            if (eT >= Uni.numMinutes) return false;
            var c = self.evalCost(Math.floor(t), eT).total;
            if (c < pCost) {
              self.poss = Math.floor(t);
              pCost = c;
            }
          });
        },
        evalCost: function(aT, eT) {
          var res = {
            travel_cost: Uni.alpha * (eT - aT),
            schedule_penalty: this.getPenalty(eT),
            toll: this.getToll(eT)
          };
          res.total = res.travel_cost + res.schedule_penalty + res.toll;
          return res;
        },
        getToll: function(t) {
          return 0;
        },
        makeChoice: function() {
          this.aT = this.poss;
          // if(this.aT === null) debugger;
        },
        setToll: function(scheme) { //call on the prototype
          switch (scheme) {
            case 'none':
              this.getToll = function(t) {
                return 0;
              };
              break;
            case 'trip':
              this.getToll = function(eT) {
                return ma(0, Uni.phiVickrey - this.getPenalty(eT));
              };
              break;
            case 'distance':
              this.getToll = function(eT) {
                return ma(0, this.phi - this.getPenalty(eT));
              };
              break;
          }
        },
        getPenalty: function(eT) {
          var sp = eT - this.wT;
          return ma(-Uni.beta * sp, Uni.gamma * sp);
        },
        setCost: function() {
          this.cost = this.evalCost(this.aT, this.eT);
        },
        place: function(minutes) {
          var M = minutes[this.aT];
          M.receive(this);
          M.arrivals++;
        }
      };
      return Car;
    });

  function ma(a, b) {
    return d3.max([a, b]);
  }
})(window.angular)
