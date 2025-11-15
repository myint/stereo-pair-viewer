import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/VRButton.js';

class StereoPairViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.leftImage = null;
        this.rightImage = null;
        this.leftMesh = null;
        this.rightMesh = null;
        this.disparity = 0;
        this.distance = 2.0;

        this.init();
        this.setupControls();
        this.animate();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;

        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);

        // Add VR button
        const vrButton = VRButton.createButton(this.renderer);
        vrButton.id = 'enter-vr';
        const oldButton = document.getElementById('enter-vr');
        oldButton.parentNode.replaceChild(vrButton, oldButton);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Load default Mars images
        this.loadDefaultImages();
    }

    loadDefaultImages() {
        const loader = new THREE.TextureLoader();

        // Load left image
        loader.load('mars_left.png',
            (texture) => {
                this.leftImage = texture;
                this.checkBothImagesLoaded();
            },
            undefined,
            (error) => {
                console.error('Error loading left image:', error);
                this.createPlaceholderImages();
            }
        );

        // Load right image
        loader.load('mars_right.png',
            (texture) => {
                this.rightImage = texture;
                this.checkBothImagesLoaded();
            },
            undefined,
            (error) => {
                console.error('Error loading right image:', error);
                this.createPlaceholderImages();
            }
        );
    }

    checkBothImagesLoaded() {
        if (this.leftImage && this.rightImage) {
            this.updateStereoPlanes();
        }
    }

    createPlaceholderImages() {
        // Create placeholder textures
        const leftCanvas = this.createPlaceholderCanvas('Left Eye', '#ff6b6b');
        const rightCanvas = this.createPlaceholderCanvas('Right Eye', '#4ecdc4');

        this.leftImage = new THREE.CanvasTexture(leftCanvas);
        this.rightImage = new THREE.CanvasTexture(rightCanvas);

        this.updateStereoPlanes();
    }

    createPlaceholderCanvas(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += 128) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 128) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        return canvas;
    }

    updateStereoPlanes() {
        // Remove old meshes
        if (this.leftMesh) this.scene.remove(this.leftMesh);
        if (this.rightMesh) this.scene.remove(this.rightMesh);

        // Calculate aspect ratio
        const aspect = this.leftImage.image.width / this.leftImage.image.height;
        const planeHeight = 2;
        const planeWidth = planeHeight * aspect;

        // Create geometry
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // Create materials
        const leftMaterial = new THREE.MeshBasicMaterial({
            map: this.leftImage,
            side: THREE.DoubleSide
        });

        const rightMaterial = new THREE.MeshBasicMaterial({
            map: this.rightImage,
            side: THREE.DoubleSide
        });

        // Create meshes
        this.leftMesh = new THREE.Mesh(geometry, leftMaterial);
        this.rightMesh = new THREE.Mesh(geometry, rightMaterial);

        // Set layers for stereo rendering
        // Layer 1 = left eye, Layer 2 = right eye
        this.leftMesh.layers.set(1);
        this.rightMesh.layers.set(2);

        // Position planes
        this.updatePlanePositions();

        // Add to scene
        this.scene.add(this.leftMesh);
        this.scene.add(this.rightMesh);
    }

    updatePlanePositions() {
        if (!this.leftMesh || !this.rightMesh) return;

        // Position both planes at the specified distance
        // Apply disparity as horizontal offset
        this.leftMesh.position.set(this.disparity / 2, 0, -this.distance);
        this.rightMesh.position.set(-this.disparity / 2, 0, -this.distance);
    }

    loadImage(file, isLeft) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const loader = new THREE.TextureLoader();
            loader.load(e.target.result, (texture) => {
                if (isLeft) {
                    this.leftImage = texture;
                } else {
                    this.rightImage = texture;
                }
                this.updateStereoPlanes();
            });
        };
        reader.readAsDataURL(file);
    }

    setupControls() {
        // Disparity slider
        const disparitySlider = document.getElementById('disparity');
        const disparityValue = document.getElementById('disparity-value');

        disparitySlider.addEventListener('input', (e) => {
            this.disparity = parseFloat(e.target.value);
            disparityValue.textContent = this.disparity.toFixed(2);
            this.updatePlanePositions();
        });

        // Distance slider
        const distanceSlider = document.getElementById('distance');
        const distanceValue = document.getElementById('distance-value');

        distanceSlider.addEventListener('input', (e) => {
            this.distance = parseFloat(e.target.value);
            distanceValue.textContent = this.distance.toFixed(1);
            this.updatePlanePositions();
        });

        // File inputs
        document.getElementById('left-image').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadImage(e.target.files[0], true);
            }
        });

        document.getElementById('right-image').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadImage(e.target.files[0], false);
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.renderer.setAnimationLoop(() => this.render());
    }

    render() {
        // In WebXR, the renderer handles stereo rendering automatically
        // We use layers to control what each eye sees

        // Get the XR session
        const session = this.renderer.xr.getSession();

        if (session) {
            // In VR mode: use layers to show different images to each eye
            this.camera.layers.enable(0); // Enable default layer
            this.camera.layers.enable(1); // Enable left eye layer
            this.camera.layers.enable(2); // Enable right eye layer

            // Store original layer settings
            const originalLayers = this.camera.layers.mask;

            // The WebXR system will call render for each eye
            // We need to set up the layer masks in the XR camera array
            this.renderer.xr.getCamera().cameras.forEach((xrCamera, index) => {
                if (index === 0) {
                    // Left eye - show only left image
                    xrCamera.layers.set(1);
                } else if (index === 1) {
                    // Right eye - show only right image
                    xrCamera.layers.set(2);
                }
            });
        } else {
            // Non-VR mode: show both images side by side
            this.camera.layers.enableAll();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application
new StereoPairViewer();
