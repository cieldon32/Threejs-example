import React from 'react';
import * as THREE from 'three';
import orbitControls from 'three-orbit-controls';
import TransformControls from 'three-transformcontrols';

const OrbitControls = orbitControls(THREE);

class House extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }
  componentDidMount() {
    this.initCanvas();
    this.loop();
  }
  initCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.position.set(330, 330, 330);
    camera.lookAt(scene.position);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector('canvas')
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x282828);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvas = renderer.domElement;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.cubes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.group = new THREE.Group();
    this.addAuxSystem();
    this.addTransform();
    this.scene.add(this.group);
    this.bindEvent();
    this.drawDesk();
    this.drawHall();
    this.drawRailing('railing1');
    this.drawRailing('railing2');
    this.drawWall();
  }
  addAuxSystem = () => {
    let gridHelper = new THREE.GridHelper(384, 32);
    this.scene.add(gridHelper);
    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    // 控制焦点
    controls.target = new THREE.Vector3(0,0,0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.25;
    this.orbitControls = controls;
  }
  addTransform() {
    const transformControls = new TransformControls(this.camera, this.canvas);
    this.transformControls = transformControls;
    this.scene.add(transformControls);
  }
  getIntersects(x,y) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    x = (x / width) * 2 - 1;
    y = -(y / height) * 2 + 1;
    this.mouse.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObject(this.group, true);
  }
  onMousedown = (e) => {
    e.preventDefault();
    const intersects = this.getIntersects(e.layerX, e.layerY);
    const obj = intersects[0] ? intersects[0].object : null;
    if(obj && obj.editAble){
      this.transformControls.attach(obj);
    } else {
      this.transformControls.detach();
    }
  }
  loop = () => {
    this.renderer.render(this.scene, this.camera);
    addEventListener('mousedown', this.onMousedown. false);
    this.transformControls.addEventListener('change', (e) => {
      const target = e.target.object;
      const {name, position} = target;
      localStorage.setItem(name, JSON.stringify(position));
    });
    requestAnimationFrame(this.loop);
  }
  addCube = ({w,h,d,x,y,z, color}) => {
    const geometry = new THREE.BoxGeometry(w,h,d);
    let material = new THREE.MeshBasicMaterial({});
    if(!color){
      for(let i = 0; i < geometry.faces.length; i += 2){
        const hex = Math.random() * 0xffffff;
        geometry.faces[i].color.setHex(hex);
        geometry.faces[i+1].color.setHex(hex);
      }
      material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});

    } else {
      material = new THREE.MeshBasicMaterial({color: 0x2194CE});
    }
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x,y,z);
    return cube;
  }
  drawDesk = () => {
    const geometry = new THREE.Geometry();
    const faces = [
      {w: 100, h: 10, d:50, x: 0, y: 55, z: 0},
      {w: 10, h: 50, d: 10, x: -45, y: 25, z: 20},
      {w: 10, h: 50, d: 10, x: 45, y: 25, z: 20},
      {w: 10, h: 50, d: 10, x: -45, y: 25, z: -20},
      {w: 10, h: 50, d: 10, x: 45, y: 25, z: -20}
    ];
    faces.map(data => {
      const cube = this.addCube(data);
      cube.updateMatrix();
      geometry.merge(cube.geometry, cube.matrix);
    });
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'desk';
    mesh.editAble = false;
    const {name}= mesh;
    let position = localStorage.getItem(name);
    position = position ? JSON.parse(position) : {x: -142, y: 0, z: -167};
    const {x,y,z} = position;
    mesh.position.set(x,y,z);
    this.group.add(mesh);
  }
  //玄关
  drawHall = () => {
    const geometry = new THREE.Geometry();
    const faces = [
      {w: 50, h: 30, d: 50, x: 0, y: 15, z: 0},
      {w: 100, h: 80, d: 50, x: 75, y: 40, z: 0}
    ];
    faces.map(data => {
      const cube = this.addCube(data);
      cube.updateMatrix();
      geometry.merge(cube.geometry, cube.matrix);
    });
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'hall';
    const {name} = mesh;
    let position = localStorage.getItem(name);
    position = position ? JSON.parse(position) : {x: -267, y: 0, z: 0};
    const {x,y,z} = position;
    // mesh.position.set(x,y,z);
    // this.group.add(mesh);
  }
  // 屏风
  drawRailing = (meshName) => {
    const geometry = new THREE.Geometry();
    const faces = [
      {w: 150, h: 10, d: 10, x: 0, y: 160, z: 0},
      {w: 150, h: 10, d: 10, x: 0, y: 5, z: 0}
    ];
    for(let i = 0; i<38; i++){
      faces.push({
        w: 2, h: 155, d: 10, x: -74 + 4 * i, z: 0 
      });
    }
    faces.map(data => {
      const cube = this.addCube(data);
      cube.updateMatrix();
      geometry.merge(cube.geometry, cube.matrix);
    });
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshName;
    const {name} = mesh;
    let position = localStorage.getItem(name);
    position = position ? JSON.parse(position) : {x: -267, y: 0, z: 0};
    const {x,y,z} = position;
    mesh.position.set(x,y,z);
    this.group.add(mesh);
  }
  // 墙壁
  drawWall = (meshName) => {
    const geometry = new THREE.Geometry();
    const faces = [
        {w: 150, h: 10, d: 10, x: 0, y: 160, z: 0},
        {w: 150, h: 10, d: 10, x: 0, y: 5, z: 0}
    ]
    for(let i = 0; i < 38; i++){
        faces.push({
            w: 2, h: 155, d: 10, x: -74 + 4*i, y: 80, z: 0
        })
    }
    faces.map(data => {
        const cube = this.addCube(data);
        cube.updateMatrix();
        // geometry.merge(cube.geometry, cube.material);
    })
    // const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.name = meshName ? meshName : 'eailing';
    // mesh.editAble = true;
    // const {name} = mesh;
    // let position = localStorage.getItem(name);
    // position = position ? JSON.parse(position) : {x: -267, y: 0, z: 0}
    // const {x,y,z} = position;
    // mesh.position.set(x,y,z);
    // this.group.add(mesh); 
  }
  bindEvent = () => {
    const transformControls = this.transformControls;
    window.addEventListener('keydown', (event) => {
      switch(event.keyCode){
        case 81: // Q
          transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
          break;
        case 12: //Ctrl
          transformControls.setTranslationSnap(100);
          transformControls.setRotationSnap(THREE.Math.degToRad(15));
          break;
        case 87: //w
          transformControls.setMode('translate');
          break;
        case 69: //E
          transformControls.setMode('rotate');
          break;
        case 82: // R
         transformControls.setMode('scale');
         break;
        case 187:
        case 107: // +, =, num+
          transformControls.setSize(transformControls.size + 0.1);
          break;
        case 189:
        case 109: // -, _, num-
          transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
          break;
        case 88: //x
          transformControls.showX = !transformControls.showX;
          break;
        case 89: //Y
          transformControls.showY = !transformControls.showY;
          break; 
        case 90: //z
          transformControls.showZ = !transformControls.showZ;
          break;
        case 32: // spacebar
          transformControls.enabled = !transformControls.enabled;
          break;
      }
    });
  }
  render(){
    return (
      <div>
        <canvas />
      </div>
    )
  }
}

export default House;