var socket,
    vis,
    endpoint = "http://" + document.domain + ":" + location.port + "/vis"


var Visualizer = function() {
  this.people = {}
}

Visualizer.prototype.onEmotions = function(emotions) {
  console.log("emoting")
  console.log(emotions)
}

Visualizer.prototype.onAvg = function(avg) {
  console.log("average")
  console.log(avg)
}

Visualizer.prototype.tick = function() {
  console.log("ugh - ticking")
}

function tick() {
  vis.tick()
}

function init() {
  socket = io.connect(endpoint)
  vis = new Visualizer()

  socket.on('connect', function() {
    console.log("connected to "+ endpoint)
  })

  socket.on('emotions', vis.onEmotions)
  socket.on('avg', vis.onAvg)
}

window.addEventListener('load', init, false);
