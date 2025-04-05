# 🐱 3D Cat Model Viewer - Next.js & Three.js

An interactive 3D model viewer built using Next.js, Three.js, and `OBJLoader`. This project renders a 360° rotatable cat model with realistic lighting, textures, and environment mapping.

## 🚀 Features

- Real-time 3D rendering using Three.js
- OBJ model loading with texture mapping
- Environment HDR lighting
- OrbitControls for smooth interaction
- Responsive design
- Model loading progress indicator
- Model details: vertices, faces, materials

## 📦 Technologies Used

- [Next.js](https://nextjs.org/)
- [Three.js](https://threejs.org/)
- [three-stdlib](https://www.npmjs.com/package/three-stdlib)
- [OBJLoader](https://threejs.org/docs/#examples/en/loaders/OBJLoader)
- [RGBELoader](https://threejs.org/docs/#examples/en/loaders/RGBELoader)

## 📁 Folder Structure

NEW3D/ 
    ├── next-threejs-obj-viewer/ # Main Next.js project folder 
    │ ├── pages/ # All page routes (e.g., index.tsx) 
    │ ├── public/ # Public assets (images, model files, etc.)
    │ ├── styles/ # Global and module CSS files 
    │ ├── package.json # Project metadata and dependencies 
    │ ├── tsconfig.json # TypeScript config (if using TypeScript) 
    │ └── ... # Other config files like .gitignore, README.md, etc.


To run the development server:

```bash
npm install
npm run dev
