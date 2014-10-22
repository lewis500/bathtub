(function(angular) {
  angular.module('mainApp')
    .factory('Runner', function() {

      function pause(P) {
        this.paused = (P === undefined) ? !this.paused : P;
        if (!this.paused) this.start();
      }

      function getPacePace() {
        return this.pace * Runner.scale;
      }

      function getPaceVel() {
        return 1000 / this.vel * Runner.scale;
      }

      function start() {
        if (this.paused || Runner.paused) return;
        var self = this;
        var pace = this.getPace();
        setTimeout(function() {
          requestAnimationFrame(self.start);
          self.callback();
        }, pace);
      }

      var Repeater = {
        init: function(name, callback, val, velOrPace) {
          _.assign(this, {
            name: name,
            type: velOrPace,
            callback: callback,
            paused: true
          });
          this.start = _.bind(start, this);
          this[velOrPace] = val;
          var getPace = (velOrPace === 'pace') ? getPacePace : getPaceVel;
          this.getPace = _.bind(getPace, this);
        },
        pause: pause
      };

      var Runner = {
        scale: 1,
        repeaters: {},
        addRepeater: function(name, callback, val, velOrPace) {
          var newRepeater = Object.create(Repeater);
          newRepeater.init(name, callback, val, velOrPace);
          this.repeaters[name] = newRepeater;
          return newRepeater;
        },
        removeRepeater: function(name) {
          this.repeaters[name].pause();
          delete this.repeaters[name];
        },
        paused: false,
        pause: pause,
        start: function() {
          var repeaters = _.values(this.repeaters);
          for (var i = 0; i < repeaters.length; i++) {
            repeaters[i].start();
          }
        }
      };
      return Runner;
    });

})(window.angular);
