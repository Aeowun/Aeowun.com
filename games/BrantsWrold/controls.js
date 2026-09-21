(function () {
  'use strict';

  var joystick = document.getElementById('joystick');
  var pauseButton = document.getElementById('pause');
  var burstButton = document.getElementById('burst');
  var playAgain = document.getElementById('playAgain');
  var message = document.getElementById('message');

  function handleKeyDown(event) {
    BWGame.startAudio();
    BWGame.setKey(event.key.toLowerCase(), true);

    if (event.code === 'Space') {
      event.preventDefault();
      BWGame.starBurst();
    }

    if (event.key.toLowerCase() === 'p') {
      BWGame.togglePause();
    }
  }

  function handleKeyUp(event) {
    BWGame.setKey(event.key.toLowerCase(), false);
  }

  function handleJoystickDown(event) {
    BWGame.startAudio();
    BWGame.setJoyPointer(event.pointerId);
    joystick.setPointerCapture(event.pointerId);
    BWGame.joystickMove(event);
  }

  function handleJoystickMove(event) {
    if (event.pointerId === BWGame.getJoyPointer()) {
      BWGame.joystickMove(event);
    }
  }

  function handleJoystickEnd() {
    BWGame.resetJoystick();
  }

  function handlePlayAgain() {
    var state = BWGame.getState();

    BWGame.startAudio();

    if (state.won || state.lost) {
      BWGame.restart();
      return;
    }

    BWGame.togglePause();
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  joystick.addEventListener('pointerdown', handleJoystickDown);
  joystick.addEventListener('pointermove', handleJoystickMove);
  joystick.addEventListener('pointerup', handleJoystickEnd);
  joystick.addEventListener('pointercancel', handleJoystickEnd);

  burstButton.addEventListener('pointerdown', function () {
    BWGame.starBurst();
  });

  pauseButton.addEventListener('pointerdown', function () {
    BWGame.togglePause();
  });

  playAgain.addEventListener('pointerdown', handlePlayAgain);

  message.addEventListener('pointerdown', function (event) {
    if (event.target === message && BWGame.getState().paused) {
      BWGame.closePausedMessage();
    }
  });
})();
