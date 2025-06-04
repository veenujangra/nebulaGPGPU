import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

import Plane from './plane'

class App {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    }

    this.init()
    this.addEventListeners()
    this.update()
    this.onResize()
  }

  init() {
    this.scene = new THREE.Scene()

    this.createElements()
    this.createCamera()
    this.createScene()
    this.createRenderer()

    this.createControls()
  }

  createElements() {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'webgl'
    // document.body.appendChild(this.canvas)
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(25, this.aspectRatio, 0.1, 100)
    this.camera.position.set(0, 0, 5)

    this.scene.add(this.camera)
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
  }

  createScene() {
    this.plane = new Plane()
    this.scene.add(this.plane.mesh)
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 1)
    // this.renderer.toneMapping = THREE.ReinhardToneMapping

    document.body.appendChild(this.renderer.domElement)
  }

  update() {
    // Update controls
    this.controls.update()

    // Update wave
    this.plane.update()

    // Render
    this.renderer.render(this.scene, this.camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(this.update.bind(this))
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
    this.sizes.aspectRatio = window.innerWidth / window.innerHeight

    this.camera.aspect = this.sizes.aspectRatio
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
}

new App()
