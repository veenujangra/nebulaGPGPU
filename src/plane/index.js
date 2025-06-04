import * as THREE from 'three'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import GUI from 'lil-gui'

export default class Plane {
  constructor() {
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
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 64, 64)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: new THREE.Uniform(0),
      },
      // wireframe: true,
      // side: THREE.DoubleSide,
      // transparent: true,
      // depthWrite: false,
      // blending: THREE.AdditiveBlending,
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    // this.mesh.rotation.x = -Math.PI * 0.5
    // this.mesh.position.x = 0
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
