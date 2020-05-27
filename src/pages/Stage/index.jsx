import React from 'react';
import * as THREE from 'three';
import orbitControls from 'three-orbit-controls';
import TransformControls from 'three-transformcontrols';

const OrbitControls = orbitControls(THREE);

class Stage extends React.Component {
  constructor(props) {
    super(props);

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
    this.drawWall();
  }
  addAuxSystem = () => {
    let gridHelper = new THREE.GridHelper(384, 32);
    this.scene.add(gridHelper);
    let orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
     // 控制焦点
     orbitControls.target = new THREE.Vector3(0,0,0);
     orbitControls.enableDamping = true;
     orbitControls.dampingFactor = 0.25;
     orbitControls.rotateSpeed = 0.35;
     this.orbitControls = orbitControls;
    
  }
  addTransform() {
    const transformcontrols = new TransformControls(this.camera, this.canvas);
    this.transformcontrols = transformcontrols;
    this.scene.add(transformcontrols);
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
      this.transformcontrols.attach(obj);
    } else {
      this.transformcontrols.detach();
    }
  }
  loop = () => {
    this.renderer.render(this.scene, this.camera);
    addEventListener('mousedown', this.onMousedown. false);
    this.transformcontrols.addEventListener('change', (e) => {
      const target = e.target.object;
      const {name, position} = target;
      localStorage.setItem(name, JSON.stringify(position));
    });
    requestAnimationFrame(this.loop);
  }
  selectItem = () => {

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
        geometry.merge(cube.geometry, cube.material);
    })
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshName ? meshName : 'eailing';
    mesh.editAble = true;
    const {name} = mesh;
    let position = localStorage.getItem(name);
    position = position ? JSON.parse(position) : {x: -267, y: 0, z: 0}
    const {x,y,z} = position;
    mesh.position.set(x,y,z);
    this.group.add(mesh); 
  }
  bindEvent = () => {
      const transformcontrols = this.transformcontrols;
      window.addEventListener('keydown', (e) => {
          switch(e.keyCode){
              case 81: //Q
              transformcontrols.setSpace(transformcontrols.space === 'local' ? 'world' : 'local')
              case 17: //Ctrl
              transformcontrols.setTranslationSnap(100)
              transformcontrols.setRotationSnap(THREE.Math.degToRad(15))
              case 87: //W
              transformcontrols.setMod('translate')
              case 69: //E
              transformcontrols.setMod('rotate')
              case 82: //R
              transformcontrols.setMod('scale')
              case 187: 
              case 107: // + = num+
              transformcontrols.setSize(transformcontrols.size + 0.1)
              case 189:
              case 109: // - _ num-
              transformcontrols.setSize(Math.max(transformcontrols.size - 0.1, 0.1))
              case 88: //x
              transformcontrols.showX = !transformcontrols.showX
              case 89: //y
              transformcontrols.showY = !transformcontrols.showY
              case 90: //z
              transformcontrols.showZ = !transformcontrols.showZ
              case 32: //Spacebar
              transformcontrols.enable = !transformcontrols.enable
          }
      })
  }
  render(){
    return (
      <div>
        <canvas />
      </div>
    )
  }
}

export default Stage;