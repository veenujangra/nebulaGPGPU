import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

import Plane from './plane'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

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
    this.createRenderer()
    this.createScene()

    this.createEffects()
    this.createControls()
  }

  createElements() {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'webgl'
    // document.body.appendChild(this.canvas)
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 100)
    this.camera.position.set(0, 0, 5)

    this.scene.add(this.camera)
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
  }

  createScene() {
    this.plane = new Plane({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
    })
    this.scene.add(this.plane.mesh)
    this.scene.add(this.plane.group)
    // console.log(this.scene)
  }

  createEffects() {
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(this.renderPass)

    this.effectShader = {
      uniforms: {
        tDiffuse: { value: null },
        brightness: { value: 1.5 },
        saturation: { value: 2.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float saturation;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          color.rgb *= brightness; // Apply brightness
          float intensity = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(intensity), color.rgb, saturation); // Apply saturation
          gl_FragColor = color;
        }
      `,
    }

    this.shaderPass = new ShaderPass(this.effectShader)
    this.composer.addPass(this.shaderPass)

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    this.composer.addPass(this.bloomPass)

    this.effectShader.uniforms.brightness.value = 2.0 // Increase brightness
    this.effectShader.uniforms.saturation.value = 3.0 // Increase saturation

    this.bloomPass.strength = 2.0 // Increase bloom strength
    this.bloomPass.radius = 2.5 // Adjust bloom radius
    this.bloomPass.threshold = 0.8 // Change bloom threshold
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
    // this.renderer.render(this.scene, this.camera)
    if (this.composer) {
      this.composer.render()
    }

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
