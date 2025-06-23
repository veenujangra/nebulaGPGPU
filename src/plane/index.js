import * as THREE from 'three'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import GUI from 'lil-gui'
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js'
import positionFragment from './shaders/gpgpu/particlePosition.glsl'
import velocityFragment from './shaders/gpgpu/particleVelocity.glsl'

export default class Plane {
  constructor(options) {
    this.config = {
      particleCount: 20000,
      particleSize: 0.1,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      noiseStrength: 6,
    }
    this.renderer = options.renderer
    this.scene = options.scene
    this.camera = options.camera
    this.group = new THREE.Group()
    this.prevTime = 0
    this.init()

    this.addEventListeners()
  }

  init() {
    this.createGeometry()
    // this.gpgpuInit()

    this.createMaterial()
    this.createMesh()

    this.debugUI()

    this.clock = new THREE.Clock()

    // this.createEffects()
  }

  debugUI() {
    this.gui = new GUI()
  }

  createGeometry() {
    // this.geometry = new THREE.PlaneGeometry(1, 1, 64, 64)
    this.geometry = new THREE.BufferGeometry()
    this.particle = {
      position: new Float32Array(this.config.particleCount * 3),
      color: new Float32Array(this.config.particleCount * 4),
      size: new Float32Array(this.config.particleCount),
      velocityX: new Float32Array(this.config.particleCount),
      velocityY: new Float32Array(this.config.particleCount),
      ttl: new Float32Array(this.config.particleCount), // Time to live
      vc: new Float32Array(this.config.particleCount), // Random velocity coefficient
    }
    this.particlePositions = new Float32Array(this.config.particleCount * 3)
    this.particleColors = new Float32Array(this.config.particleCount * 3)
    this.particleSizes = new Float32Array(this.config.particleCount)

    for (let i = 0; i < this.config.particleCount; i++) {
      // Random Position and Color
      const theta = Math.random() * Math.PI * 2 // Random angle in radians
      // Random distance from the center
      const rdist = Math.random() * 2.5

      this.particle.position[i * 3 + 0] = Math.cos(theta) * rdist // X position
      this.particle.position[i * 3 + 1] = Math.sin(theta) * rdist // Y position
      this.particle.position[i * 3 + 2] = 0 // Z position

      // Random Velocity
      this.particle.velocityX[i] = this.particle.velocityY[i] = 0 // Start with zero velocity

      this.particle.ttl[i] = 100 + Math.random() * 200 // Time to live
      this.particle.vc[i] = 1 + Math.random() * 10 // Random velocity coefficient

      this.particle.color[i * 3 + 0] = (60 + Math.random() * 20) / 255 // Red
      this.particle.color[i * 3 + 1] = (60 + Math.random() * 30) / 255 // Green
      this.particle.color[i * 3 + 2] = (130 + Math.random() * 50) / 255 // Blue
      this.particle.color[i * 3 + 3] = 0 // Alpha

      // Random Size
      this.particle.size[i] = Math.random() * this.config.particleSize // Ensure size is not zero
    }

    // Set attributes for the geometry
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.particle.position, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.particle.color, 4))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.particle.size, 1))
    this.geometry.setAttribute('aVX', new THREE.BufferAttribute(this.particle.velocityX, 1))
    this.geometry.setAttribute('aVY', new THREE.BufferAttribute(this.particle.velocityY, 1))
    this.geometry.setAttribute('aTTL', new THREE.BufferAttribute(this.particle.ttl, 1))
    this.geometry.setAttribute('aVC', new THREE.BufferAttribute(this.particle.vc, 1))

    // Initialize GPGPU textures
    this.gpgpuInit()

    this.particleUV = new Float32Array(this.config.particleCount * 2)
    for (let y = 0; y < this.gpgpu.size; y++) {
      for (let x = 0; x < this.gpgpu.size; x++) {
        const i = y * this.gpgpu.size + x
        const i2 = i * 2
        const uvX = (x + 0.5) / this.gpgpu.size
        const uvY = (y + 0.5) / this.gpgpu.size

        this.particleUV[i2 + 0] = uvX
        this.particleUV[i2 + 1] = uvY
      }
    }

    this.geometry.setAttribute('aParticleUv', new THREE.BufferAttribute(this.particleUV, 2))
  }

  gpgpuInit() {
    this.gpgpu = {}
    this.gpgpu.size = Math.ceil(Math.sqrt(this.geometry.attributes.position.count))
    this.gpgpu.computation = new GPUComputationRenderer(this.gpgpu.size, this.gpgpu.size, this.renderer)
    this.gpgpu.positionTexture = this.gpgpu.computation.createTexture()
    this.gpgpu.velocityTexture = this.gpgpu.computation.createTexture()

    // Initialize position and velocity textures

    for (let i = 0; i < this.config.particleCount; i++) {
      // const i2 = i * 2
      const i3 = i * 3
      const i4 = i * 4
      this.gpgpu.positionTexture.image.data[i4 + 0] = this.geometry.attributes.position.array[i3 + 0] // X position
      this.gpgpu.positionTexture.image.data[i4 + 1] = this.geometry.attributes.position.array[i3 + 1] // Y position
      this.gpgpu.positionTexture.image.data[i4 + 2] = this.geometry.attributes.position.array[i3 + 2] // Z position
      this.gpgpu.positionTexture.image.data[i4 + 3] = Math.random() // W position (unused)

      this.gpgpu.velocityTexture.image.data[i4 + 0] = this.geometry.attributes.aVX.array[i] // X velocity
      this.gpgpu.velocityTexture.image.data[i4 + 1] = this.geometry.attributes.aVY.array[i] // Y velocity
      this.gpgpu.velocityTexture.image.data[i4 + 2] = 0
      this.gpgpu.velocityTexture.image.data[i4 + 2] = this.geometry.attributes.aVC.array[i] // Velocity coefficient
    }

    this.gpgpu.positionVariable = this.gpgpu.computation.addVariable('uParticlePositionTexture', positionFragment, this.gpgpu.positionTexture)
    this.gpgpu.velocityVariable = this.gpgpu.computation.addVariable('uParticleVelocityTexture', velocityFragment, this.gpgpu.velocityTexture)

    this.gpgpu.computation.setVariableDependencies(this.gpgpu.positionVariable, [this.gpgpu.positionVariable, this.gpgpu.velocityVariable])
    this.gpgpu.computation.setVariableDependencies(this.gpgpu.velocityVariable, [this.gpgpu.positionVariable, this.gpgpu.velocityVariable])

    this.gpgpu.positionVariable.material.uniforms.uTime = { value: 0 }
    this.gpgpu.positionVariable.material.uniforms.uDeltaTime = { value: 0 }
    // Initial Position
    this.gpgpu.velocityVariable.material.uniforms.uTime = { value: 0 }

    this.gpgpu.positionVariable.material.uniforms.uBasePositionTexture = new THREE.Uniform(this.gpgpu.positionTexture)

    this.gpgpu.computation.init()

    // this.gpgpuDebug()
  }

  gpgpuDebug() {
    // Render debug plane in a separate pass to avoid feedback loop
    this.debugPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        map: this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionVariable).texture,
      })
    )
    this.debugPlane.position.set(3, 0, 0)
    this.group.add(this.debugPlane)

    console.log(this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionVariable).texture)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uSize: new THREE.Uniform(this.config.particleSize),
        uResolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth * this.config.pixelRatio, window.innerHeight * this.config.pixelRatio)),
        uNoiseStrength: new THREE.Uniform(this.config.noiseStrength),
        uPositionTexture: new THREE.Uniform(),
        uVelocityTexture: new THREE.Uniform(),
      },
      // wireframe: true,
      // side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }

  createMesh() {
    // this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh = new THREE.Points(this.geometry, this.material)
    // this.mesh.rotation.x = -Math.PI * 0.5
    // this.mesh.position.x = 0
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {
    console.log(this.material.uniforms.uPositionTexture.value)
    this.material.uniforms.uResolution.value.set(window.innerWidth * this.config.pixelRatio, window.innerHeight * this.config.pixelRatio)
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime()
    const deltaTime = elapsedTime - this.prevTime
    this.prevTime = elapsedTime
    // Update GPGPU textures
    this.gpgpu.positionVariable.material.uniforms.uTime.value = this.gpgpu.velocityVariable.material.uniforms.uTime.value = elapsedTime
    this.gpgpu.positionVariable.material.uniforms.uDeltaTime.value = deltaTime

    this.gpgpu.computation.compute()

    this.material.uniforms.uPositionTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionVariable).texture
    this.material.uniforms.uVelocityTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.velocityVariable).texture

    this.material.uniforms.uTime.value = elapsedTime
  }
}
