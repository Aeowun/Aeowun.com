/* Brantsworld audio module */
(function () {
  'use strict';

  var sounds = {
    music: new Audio('sounds/mainsong.mp3'),
    crystal: new Audio('sounds/waterdropletsound.mp3'),
    burst: new Audio('sounds/success.mp3'),
    robot: new Audio('sounds/save.mp3'),
    win: new Audio('sounds/gameover_win.mp3'),
    crumble: new Audio('sounds/crumblingsound.mp3')
  };

  sounds.music.loop = true;
  sounds.music.volume = 0.32;
  sounds.crystal.volume = 0.55;
  sounds.burst.volume = 0.7;
  sounds.robot.volume = 0.75;
  sounds.win.volume = 0.85;
  sounds.crumble.volume = 0.45;

  var started = false;

  window.BWAudio = {
    sounds: sounds,
    start: function () {
      if (started) return;
      started = true;
      sounds.music.play().catch(function () { started = false; });
    },
    play: function (sound) {
      sound.currentTime = 0;
      sound.play().catch(function () {});
    },
    playMusic: function () {
      sounds.music.play().catch(function () {});
    },
    pauseMusic: function () {
      sounds.music.pause();
    },
    resetMusic: function () {
      sounds.music.currentTime = 0;
    }
  };
})();
