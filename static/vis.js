var socket,
    vis,
    endpoint = "http://" + document.domain + ":" + location.port + "/vis"


var Visualizer = function() {
  this._people = {}
  this._circles = {}
  this._playing = false
  this._count = 0
  this._dcount = 0
  this._mean = [0,0,0,0]
  this._dmean = [0,0,0,0]
  this._intensity = 0
  this._dintensity = 0

  canvas = document.getElementById("vslzr")
  stage = new Stage(canvas)
  stage.autoClear = false
  audio = document.getElementById("dmb")
  var w = canvas.width,
      h = canvas.height
  scanLineImage = new Image()
  scanLineImage.src = "/static/scanlines.png"
  Ticker.addListener(window)
  var screen = new Shape()
  screen.graphics.beginFill("rgba(16,16,16,.25)").drawRect(0, 0, w + 1, h + 1)
  star = new Shape()
  star.graphics.beginFill(Graphics.getRGB(128, 40, 255, .03)).drawPolyStar(0, 0, h * .3, 48, .95)
  star.graphics.beginFill(Graphics.getRGB(128, 40, 255, .18)).drawPolyStar(0, 0, h * .35, 6, .93)
  star.graphics.beginFill(Graphics.getRGB(128, 40, 255, .05)).drawPolyStar(0, 0, h * .32, 24, .93)
  star.compositeOperation = "lighter"
  star2 = star.clone()
  star.alpha = .2
  star2.alpha = .2
  bg = new Container()
  bg.addChild(star, star2)
  fpsFld = new Text("", "10px Arial", "#FFF")
  fpsFld.alpha = .4
  fpsFld.x = 20
  fpsFld.y = 26
  var r = 40
  backSphere = new Shape()
  backSphere.graphics.beginFill("#111").drawCircle(0, 0, r)
  frontSphere = new Shape()
  frontSphere.graphics.beginRadialGradientFill(["rgba(0,0,0,0)", "rgba(0,0,0,.6)"], [0, 1], -r * .2, -r * .2, 0, -r * .1, -r * .1, r)
  frontSphere.graphics.drawCircle(0, 0, r)
  glow = new Shape()
  glow.graphics.beginRadialGradientFill(["rgba(230,180,255,.5)", "rgba(10,30,255,0)"], [0, 1], 0, 0, 0, 0, 0, w / 2).drawCircle(0, 0, w / 2)
  glow.graphics.beginFill("rgba(128,0,128,.1)").drawCircle(0, 0, r)
  glow.graphics.beginFill("rgba(160,128,255,.1)").drawCircle(0, 0, r * 2)
  glow.compositeOperation = "lighter"
  light = new Shape()
  light.graphics.beginFill("#95F").drawCircle(0, 0, r)
  light.x = backSphere.x = glow.x = frontSphere.x = w / 2
  light.y = backSphere.y = glow.y = frontSphere.y = h / 2
  light.compositeOperation = "lighter"
  scanLines = new Shape()
  bg.x = canvas.width / 2
  bg.y = canvas.height / 2
  bg.addChild(light, glow)
  bg.scaleX = canvas.width / canvas.height /2
  frontCircles = new Container()
  backCircles = new Container()
  frontCircles.x = backCircles.x = w / 2
  frontCircles.y = backCircles.y = h / 2
  loadingFld = new Text("Loading audio...", "21px Arial", "#333")
  loadingFld.textAlign = "center"
  loadingFld.textBaseline = "middle"
  loadingFld.x = w / 2
  loadingFld.y = h / 2
  stage.addChild(screen, fpsFld, loadingFld)
  stage.update()
  Ticker.setFPS(24)
}

function generateColors(person) {
  var colors = [
    Math.min((500*Math.sqrt(person[0]*person[3]))|0,255),
    Math.min((600*Math.sqrt(person[1]*person[3]))|0,255),
    Math.min((300*Math.sqrt(person[2]*person[3]))|0,255)
  ]
  
  return colors

}

function newCircle(person) {
  var circle = new Shape()
  var colors = generateColors(person)
  console.log("colors:")
  console.log(colors)
  circle.graphics.beginFill('rgb('+colors[0]+','+colors[1]+','+colors[2]+')').drawCircle(circle.x, circle.y, 50);
  var a = Math.random() * Math.PI * 2,
      d = Math.random() * 110 + 40;
  circle._x = Math.cos(a) * d;
  circle._y = Math.sin(a) * d;
  circle.z = Math.random() * 50 + 100;
  a = Math.random() * Math.PI * 2;
  d = Math.random() * 15 + 10;
  circle.velX = Math.cos(a) * d;
  circle.velY = Math.sin(a) * d;
  circle.velZ = Math.random() * 30 - 15;
  circle.alpha = .9;

  return circle
}

function updateCircle(circle, person) {
  var colors = generateColors(person)
  
  circle.graphics.beginFill('rgb('+colors[0]+','+colors[1]+','+colors[2]+')').drawCircle(0, 0, 50);
  circle.graphics.beginFill(Graphics.getRGB(colors[0], colors[1], colors[2], Math.random() * .1 + .1)).drawCircle(0, 0, 50);

  focalDistance = 350
  circle.velX += circle.x * -.005;
  circle.velY += circle.y * -.005;
  circle.velZ += circle.z * -.005;
  circle._x += circle.velX;
  circle._y += circle.velY;
  circle.z += circle.velZ;
  var p = focalDistance / (circle.z + 400);
  circle.x = circle._x * p;
  circle.y = circle._y * p;
  var intensity = person[0] + person[1] + person[2] + person[3]
  circle.scaleX = circle.scaleY = intensity * p * .5;

  circle.alpha = 1 
}

Visualizer.prototype.onData = function(data) {
  // console.log("emoting")

  var id = data["user"]
  var count = data["count"]
  this._dcount = this._count - count
  this._count = count
  var emotions = data["emotions"]
  var averages = data["averages"]

  this._people[id] = emotions
  this._intensity = 0

  for (i = 0; i < 4; i++) {
    this._dmean[i] = this._mean[i] - averages[i]
    this._intensity += averages[i]
    this._dintensity += this._dmean[i]
  } 

  this._mean = averages
}

Visualizer.prototype.tick = function() {
  if (!this._playing) {
    this._playing = true
    scanLines.graphics.beginBitmapFill(scanLineImage).drawRect(0, 0, canvas.width + 1, canvas.height + 1)
    stage.addChild(bg, glow, backCircles, backSphere, light, frontSphere, frontCircles, scanLines, fpsFld)
    stage.clear();
  }
  star.rotation += this._dintensity
  star2.rotation = -star.rotation
  glow.alpha = this._intensity * 0.1
  light.alpha = (this._intensity * this._dintensity) * 0.2
  glow.scaleX = glow.scaleY = star.scaleX = star.scaleY = this._count * 0.5
  bg.alpha =  this._intensity - .1
  scanLines.alpha = 1 - this._intensity * this._dintensity * .8
  var s = this._intensity * this._dintensity * .8 

  // var colors = generateColors(this._mean)
  // glow..graphics.beginFill('rgb('+colors[0]+','+colors[1]+','+colors[2]+')').drawCircle(0, 0, 50);


  for (var id in this._people) {
    var person = this._people[id]
    var circle = this._circles[id]
    if (!circle) {
      this._circles[id] = newCircle(person)
      circle = this._circles[id]
    } else {
      updateCircle(this._circles[id], person)
  }

    backCircles.addChild(circle);
    frontCircles.addChild(circle);
  //   if (circle.z > 0) {
  //     if (Math.sqrt(circle.x * circle.x + circle.y * circle.y) < 60 || 
  //       (Math.random() < .15 && circle.z >= 100)) {
  //         if (circle.parent) {
  //             circle.parent.removeChild(circle);
  //         }
  //       } else {
  //           backCircles.addChild(circle);
  //       }
  //     } else {
  //         frontCircles.addChild(circle);
  //     }
  }
  stage.update()
}

function tick() {
  vis.tick()
}

function init() {
  socket = io.connect(endpoint)
  vis = new Visualizer()

  socket.on('connect', function() {
    // console.log("connected to "+ endpoint)
  })

  socket.on('emotions', vis.onData.bind(vis))
}

window.addEventListener('load', init, false)
