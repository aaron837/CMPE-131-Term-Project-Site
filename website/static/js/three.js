import * as THREE from 'https://cdn.skypack.dev/three@0.133.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js';

/**
 * Base
 */


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 9999
parameters.size = 0.001
parameters.radius = 6
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.01
parameters.randomnessPower = 1
parameters.insideColor = '#FF6500'
parameters.outsideColor = '#FF00FE'

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const randomness = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius
    
        randomness[i3    ] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms:
        {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        },    
        vertexShader: `
        uniform float uTime;
        uniform float uSize;

        attribute vec3 aRandomness;
        attribute float aScale;

        varying vec3 vColor;

        void main()
        {
            /**
             * Position
             */
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                        
            // Rotate
            float angle = atan(modelPosition.x, modelPosition.z);
            float distanceToCenter = length(modelPosition.xz);
            float angleOffset = (1.0 / distanceToCenter) * uTime;
            angle += angleOffset;
            modelPosition.x = cos(angle) * distanceToCenter;
            modelPosition.z = sin(angle) * distanceToCenter;
        
            // Randomness
            modelPosition.xyz += aRandomness;
        
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;
        
            /**
             * Size
             */
            gl_PointSize = uSize * aScale;
            gl_PointSize *= (1.0 / - viewPosition.z);
        
            /**
             * Color
             */
            vColor = color;
        }`,
        fragmentShader: `
        varying vec3 vColor;
        void main()
        {
            // // Disc
            // float strength = distance(gl_PointCoord, vec2(0.5));
            // strength = step(0.5, strength);
            // strength = 1.0 - strength;
        
            // // Diffuse point
            // float strength = distance(gl_PointCoord, vec2(0.5));
            // strength *= 2.0;
            // strength = 1.0 - strength;
        
            // Light point
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 10.0);
        
            // Final color
            vec3 color = mix(vec3(0.0), vColor, strength);
            gl_FragColor = vec4(color, 1.0);
        }`
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Generate the first galaxy
 */
generateGalaxy()

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime/2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()