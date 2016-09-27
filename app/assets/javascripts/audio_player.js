function AudioPlayer() {
  var _this = this

  _this.setup = function() {
    $('audio').mediaelementplayer({
      audioWidth: 400,
      audioHeight: 30,
      startVolume: 0.8,
      enableAutosize: true,
      alwaysShowControls: true
    });
  }
}

$(document).ready(function() {
  var audioPlayer = new AudioPlayer()
  audioPlayer.setup()
})
