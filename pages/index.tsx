import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import * as THREE from 'three';
import { ColorManagement } from 'three';
import { OrbitControls } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { RGBELoader } from 'three-stdlib';

import styles from '../styles/Home.module.css';

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelInfo, setModelInfo] = useState({
    name: 'Cat Model',
    vertices: 0,
    faces: 0,
    materials: 0,
    loaded: false
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const sceneRef = useRef(new THREE.Scene());
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    ColorManagement.enabled = true;

    // Scene setup
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 5);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    
    if (mountRef.current && !mountRef.current.firstChild) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Enhanced OrbitControls for 360° rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 1.9; // Limit vertical rotation
    controls.minPolarAngle = Math.PI * 0.2; // Limit vertical rotation
    controls.autoRotate = false; // Disable auto-rotation
    controls.enablePan = false; // Disable panning for pure rotation
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;
    
    // Lighting setup (same as before)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1);
    rimLight.position.set(-2, 3, -3);
    scene.add(rimLight);
    
    // Environment map
    new RGBELoader()
      .setPath('/')
      .load('environment.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
      });
    
    // Loading manager
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadingProgress(Math.floor((itemsLoaded / itemsTotal) * 100));
    };
    
    // Load texture
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const texture = textureLoader.load('/texture.jpg');
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
    // Material with texture
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.2,
      normalScale: new THREE.Vector2(0.5, 0.5)
    });
    
    // Load OBJ model
    const objLoader = new OBJLoader(loadingManager);
    objLoader.load(
      '/model.obj',
      (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.geometry) {
              setModelInfo({
                name: 'Cat Model',
                vertices: child.geometry.attributes.position.count,
                faces: child.geometry.index ? child.geometry.index.count / 3 : 0,
                materials: 1,
                loaded: true
              });
            }
          }
        });
        
        object.position.y = -0.5;
        object.rotation.y = Math.PI;
        scene.add(object);
        
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        
        camera.position.z = size * 1.5;
        controls.maxDistance = size * 3;
        controls.target.copy(center);
        controls.update();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Only updates when user interacts due to damping
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>3D Cat Model Viewer</title>
        <meta name="description" content="Interactive 360° 3D Cat Model Viewer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div 
          ref={mountRef} 
          className={styles.canvas}
          style={{ width: '100%', height: '100vh' }}
        />
        
        {!modelInfo.loaded && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading... {loadingProgress}%</p>
          </div>
        )}
        
        {modelInfo.loaded && (
          <div className={styles.modelInfo}>
            <h3>Model Information</h3>
            <p><strong>Name:</strong> {modelInfo.name}</p>
            <p><strong>Vertices:</strong> {modelInfo.vertices.toLocaleString()}</p>
            <p><strong>Faces:</strong> {modelInfo.faces.toLocaleString()}</p>
            <p><strong>Materials:</strong> {modelInfo.materials}</p>
            <div className={styles.controlsHint}>
              <p>Scroll to zoom</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}