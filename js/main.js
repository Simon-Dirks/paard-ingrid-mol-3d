import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer, horseScene, horseOpacity = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('assets/clouds.jpg');
    scene.background = bgTexture;

    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1;
    camera.position.z = 2;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;
    controls.autoRotate = true;

    controls.minDistance = 1;
    controls.maxDistance = 10;

    controls.maxPolarAngle = Math.PI / 2;

    // Model
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.121.0/examples/js/libs/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load('assets/horse.glb', function(gltf) {
        horseScene = gltf.scene;

        horseScene.traverse(function(child) {
            if (child.isMesh) {
                child.material.transparent = true;
            }
        });

        camera.lookAt(horseScene.position);

        scene.add(horseScene);

        const loaderElem = document.getElementById('loader')
        loaderElem.style.display = 'none';
    }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function(error) {
        console.error(error);
    });


    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (horseScene !== undefined) {
        if (horseOpacity < 1) {
            horseScene.traverse(function(child) {
                if (child.isMesh) {
                    child.material.opacity = horseOpacity;
                    horseOpacity += 0.002;
                }
            });
        }
    }

    render();
}

function render() {
    renderer.render(scene, camera);
}