import * as THREE from 'three'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import GUI from 'lil-gui'

export default class Wave {
  constructor() {
    this.colors = {
      color1: '#fff',
      color2: '#000',
    }

    this.init()

    this.addEventListeners()
  }

  init() {
    this.createGeometry()
    this.createMaterial()
    this.createMesh()

    this.debugUI()

    this.clock = new THREE.Clock()
  }

  debugUI() {
    this.gui = new GUI()
    this.gui.add(this.material.uniforms.uBigWaveElevation, 'value').name('Big Wave Elevation').step(0.001).min(0).max(1)
    this.gui.add(this.material.uniforms.uBigWaveFrequency.value, 'x').name('Big Wave Frequency X').step(0.001).min(0).max(10)
    this.gui.add(this.material.uniforms.uBigWaveFrequency.value, 'y').name('Big Wave Frequency Y').step(0.001).min(0).max(10)
    this.gui.add(this.material.uniforms.uBigWaveSpeed, 'value').name('Big Wave Speed').step(0.001).min(0).max(4)

    this.gui.add(this.material.uniforms.uSmallWaveIteration, 'value').name('Small Wave Iteration').step(1).min(0).max(5)
    this.gui.add(this.material.uniforms.uSmallWaveSpeed, 'value').name('Small Wave Speed').step(0.001).min(0).max(1)
    this.gui.add(this.material.uniforms.uSmallWaveFrequency, 'value').name('Small Wave Frequency').step(0.001).min(0).max(30)
    this.gui.add(this.material.uniforms.uSmallWaveIntensity, 'value').name('Small Wave Intensity').step(0.001).min(0).max(1)

    this.gui
      .addColor(this.colors, 'color1')
      .name('Color 1')
      .onChange(() => {
        this.material.uniforms.uColor1.value.set(this.colors.color1)
      })
    this.gui
      .addColor(this.colors, 'color2')
      .name('Color 2')
      .onChange(() => {
        this.material.uniforms.uColor2.value.set(this.colors.color2)
      })
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(3, 1, 1024, 64)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: new THREE.Uniform(0),

        uBigWaveElevation: new THREE.Uniform(0.049),
        uBigWaveFrequency: new THREE.Uniform(new THREE.Vector2(4, 1)),
        uBigWaveSpeed: new THREE.Uniform(1.032),

        uSmallWaveIteration: new THREE.Uniform(1),
        uSmallWaveSpeed: new THREE.Uniform(0.27),
        uSmallWaveFrequency: new THREE.Uniform(3.538),
        uSmallWaveIntensity: new THREE.Uniform(0.369),

        uColor1: new THREE.Uniform(new THREE.Color(this.colors.color1)),
        uColor2: new THREE.Uniform(new THREE.Color(this.colors.color2)),
      },
      // wireframe: true,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * 0.5
    this.mesh.position.x = 0
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {}

  update() {
    const elapsedTime = this.clock.getElapsedTime()

    this.material.uniforms.uTime.value = elapsedTime
  }
}
