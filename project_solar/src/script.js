import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// Initialize pane
const pane = new Pane();

// Initialize the scene
const scene = new THREE.Scene();

// Initialize texture loader
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Set paths - adjust these according to your file structure
textureLoader.setPath('/textures/');
cubeTextureLoader.setPath('/textures/cubeMap/');

// Load textures with error handling
const loadTexture = (path) => {
  return textureLoader.load(path, undefined, undefined, (error) => {
    console.error('Error loading texture:', error);
  });
};

// Load textures
const sunTexture = loadTexture("2k_sun.jpg");
sunTexture.colorSpace = THREE.SRGBColorSpace;
const mercuryTexture = loadTexture("2k_mercury.jpg");
const venusTexture = loadTexture("2k_venus_surface.jpg");
const earthTexture = loadTexture("2k_earth_daymap.jpg");
const marsTexture = loadTexture("2k_mars.jpg");
const jupiterTexture = loadTexture("2k_jupiter.jpg");
const saturnTexture = loadTexture("2k_saturn.jpg");
const saturnRingTexture = loadTexture("2k_saturn_ring_alpha.png");
saturnRingTexture.colorSpace = THREE.SRGBColorSpace;
const uranusTexture = loadTexture("2k_uranus.jpg");
const neptuneTexture = loadTexture("2k_neptune.jpg");
const moonTexture = loadTexture("2k_moon.jpg");

// Load background cubemap
const backgroundCubemap = cubeTextureLoader.load([
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
]);
scene.background = backgroundCubemap;

// Create materials
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTexture });
const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });
const saturnRingMaterial = new THREE.MeshStandardMaterial({
  map: saturnRingTexture,
  side: THREE.DoubleSide,
  transparent: true,
  alphaTest: 0.1,
  depthWrite: false,
  opacity: 0.8
});
const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTexture });
const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// Define planet data with realistic orbital speeds (scaled down)
const planets = [
  {
    name: "Sun",
    radius: 5,
    distance: 0,
    speed: 0,
    material: sunMaterial,
    moons: []
  },
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.0479,  // 47.9 km/s scaled
    material: mercuryMaterial,
    moons: []
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.0350,  // 35.0 km/s scaled
    material: venusMaterial,
    moons: []
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.0298,  // 29.8 km/s scaled
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.0298 + 0.001,  // Slightly faster than Earth
        material: moonMaterial
      }
    ]
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.0241,  // 24.1 km/s scaled
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.0241 + 0.002,
        material: moonMaterial
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.0241 + 0.0015,
        material: moonMaterial
      }
    ]
  },
  {
    name: "Jupiter",
    radius: 1.5,
    distance: 30,
    speed: 0.0130,  // 13.0 km/s scaled
    material: jupiterMaterial,
    moons: [
      {
        name: "Io",
        radius: 0.4,
        distance: 3,
        speed: 0.0130 + 0.005,
        material: moonMaterial
      },
      {
        name: "Europa",
        radius: 0.3,
        distance: 4,
        speed: 0.0130 + 0.004,
        material: moonMaterial
      }
    ]
  },
  {
    name: "Saturn",
    radius: 1.2,
    distance: 40,
    speed: 0.0097,  // 9.7 km/s scaled
    material: saturnMaterial,
    hasRings: true,
    ringInnerRadius: 1.5,
    ringOuterRadius: 2.5,
    moons: [
      {
        name: "Titan",
        radius: 0.4,
        distance: 5,
        speed: 0.0097 + 0.003,
        material: moonMaterial
      }
    ]
  },
  {
    name: "Uranus",
    radius: 1,
    distance: 50,
    speed: 0.0068,  // 6.8 km/s scaled
    material: uranusMaterial,
    moons: []
  },
  {
    name: "Neptune",
    radius: 1,
    distance: 55,
    speed: 0.0054,  // 5.4 km/s scaled
    material: neptuneMaterial,
    moons: []
  }
];

// Create geometries
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// Create planet and moon meshes
const createPlanet = (planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetMesh.position.x = planet.distance;
  planetMesh.name = planet.name;
  
  if (planet.hasRings) {
    const ringGeometry = new THREE.RingGeometry(
      planet.ringInnerRadius, 
      planet.ringOuterRadius, 
      64
    );
    const ringMesh = new THREE.Mesh(ringGeometry, saturnRingMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    planetMesh.add(ringMesh);
  }
  
  return planetMesh;
};

const createMoon = (moon) => {
  const moonMesh = new THREE.Mesh(sphereGeometry, moon.material);
  moonMesh.scale.setScalar(moon.radius);
  moonMesh.position.x = moon.distance;
  moonMesh.name = moon.name;
  return moonMesh;
};

// Add planets and moons to scene
const planetMeshes = planets.map((planet) => {
  const planetMesh = createPlanet(planet);
  scene.add(planetMesh);

  planet.moons.forEach((moon) => {
    const moonMesh = createMoon(moon);
    planetMesh.add(moonMesh);
  });
  
  return planetMesh;
});

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Initialize camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 100;
camera.position.y = 5;

// Initialize renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ 
  canvas: canvas, 
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const renderLoop = () => {
  planetMeshes.forEach((planet, planetIndex) => {
    if (planetIndex > 0) {
      planet.rotation.y += planets[planetIndex].speed;
      planet.position.x = Math.sin(planet.rotation.y) * planets[planetIndex].distance;
      planet.position.z = Math.cos(planet.rotation.y) * planets[planetIndex].distance;
      
      planet.children.forEach((child, moonIndex) => {
        if (child.name && planets[planetIndex].moons[moonIndex]) {
          child.rotation.y += planets[planetIndex].moons[moonIndex].speed;
          child.position.x = Math.sin(child.rotation.y) * planets[planetIndex].moons[moonIndex].distance;
          child.position.z = Math.cos(child.rotation.y) * planets[planetIndex].moons[moonIndex].distance;
        }
      });
    }
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();