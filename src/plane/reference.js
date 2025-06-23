const { buffer, ctx } = createRenderingContext()
const particleCount = 20000
const particleProps = ['x', 'y', 'vx', 'vy', 'a', 'l', 'ttl', 'vc', 'r', 'g', 'b']
const noiseSteps = 6
const simplex = new SimplexNoise()

let tick = 0
let imageBuffer
let particles
let width
let height
let centerx
let centery
let stats
let frame

window.addEventListener('resize', resize)
window.addEventListener('load', start)

function start() {
  createStats()
  setup()
  render()
}

function setup() {
  resize()
  createParticles()
}

function render() {
  frame = requestAnimationFrame(render)

  try {
    stats.begin()

    tick++
    updateParticles()
    drawBackground()
    renderFrame()

    stats.end()
  } catch {
    cancelAnimationFrame(frame)
  }
}

function drawBackground() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)
}

function updateParticles() {
  let i, index, newCoords, n, x, y, vx, vy, a, l, ttl, vc, r, g, b

  imageBuffer.data.fill(0)

  particles.forEach(([x, y, vx, vy, a, l, ttl, vc, r, g, b], index) => {
    ;(i = 4 * ((x | 0) + (y | 0) * width)), ([l, a] = updatePixelAlpha(l, ttl))

    if (l < ttl && !outOfBounds(x, y, width, height)) {
      ;[x, y, vx, vy, vc] = updatePixelCoords(x, y, vx, vy, vc)

      particles.set([x, y, vx, vy, a, l], index)

      fillPixel(imageBuffer, i, [r, g, b, a])
    } else {
      resetParticle(index)
    }
  })

  buffer.putImageData(imageBuffer, 0, 0)
}

function updatePixelCoords(x, y, vx, vy, vc) {
  let n = simplex.noise3D(x * 0.0025, y * 0.00125, tick * 0.00025) * TAU * noiseSteps

  vx = lerp(vx, cos(n) * vc, 0.015)
  vy = lerp(vy, sin(n) * vc, 0.015)

  x += vx
  y += vy

  return [x, y, vx, vy]
}

function updatePixelAlpha(l, ttl) {
  l++
  return [l, fadeInOut(l, ttl) * 255]
}

function createParticles() {
  particles = new PropsArray(particleCount, particleProps)

  particles.map(createParticle)
}

function resetParticle(i) {
  particles.set(createParticle(), i)
}

function createParticle(v, i) {
  let theta, rdist, x, y, vx, vy, a, l, ttl, vc, r, g, b

  theta = rand(TAU)
  rdist = randRange(250)
  x = centerx + rdist * cos(theta)
  y = centery + rdist * sin(theta)
  vx = vy = 0
  l = 0
  ttl = 100 + rand(200)
  vc = randIn(1, 10)
  a = 0
  r = (80 + rand(20)) | 0
  g = (80 + rand(40)) | 0
  b = (100 + rand(100)) | 0

  return [x, y, vx, vy, a, l, ttl, vc, r, g, b]
}

function renderFrame() {
  ctx.save()

  ctx.filter = 'blur(4px) brightness(150%)'
  ctx.drawImage(buffer.canvas, 0, 0)

  ctx.globalCompositeOperation = 'lighter'

  ctx.filter = 'saturate(200%)'
  ctx.drawImage(buffer.canvas, 0, 0)

  ctx.restore()
}

function clearScreen() {
  clear(ctx)
}

function clearBuffer() {
  clear(buffer)
}

function clear(_ctx) {
  _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height)
}

function drawImage(_ctx, image, x = 0, y = 0) {
  _ctx.drawImage(image, x, y)
}

function outOfBounds(x, y, width, height) {
  return y < 1 || y > height - 1 || x < 1 || x > width - 1
}

function fillPixel(imageData, i, [r, g, b, a]) {
  imageData.data.set([r, g, b, a], i)
}

function resize() {
  buffer.canvas.width = ctx.canvas.width = width = innerWidth
  buffer.canvas.height = ctx.canvas.height = height = innerHeight

  centerx = 0.5 * innerWidth
  centery = 0.5 * innerHeight

  imageBuffer = buffer.createImageData(innerWidth, innerHeight)
}

function createStats() {
  stats = new Stats()
  stats.domElement.style.position = 'absolute'
  document.body.appendChild(stats.domElement)
}
