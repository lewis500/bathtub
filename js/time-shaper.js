(function() {

  function TimeShaper() {
    function pause(P) {
      this.paused = (P === undefined) ? !this.paused : P;
      if (!this.paused) this.start();
    }

    function Repeater(name, callback, val, velOrPace) {
      var Repeater = {
        name: name,
        type: velOrPace,
        callback: callback,
        paused: true,
        start: function() {
          if (this.paused || Runner.paused) return;
          var self = this;
          var pace = this.getPace();
          setTimeout(function() {
            requestAnimationFrame(self.start);
            self.callback();
          }, pace);
        },
        pause: pause
      };

      Repeater.getPace = ((velOrPace === 'velocity') ? function() {
        return this.pace * Runner.scale;
      } : function() {
        return 1000 / this.vel * Runner.scale;
      });

      return Repeater;
    }

    var TimeShaper = {
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
    return timeShaper;
  }

})();
