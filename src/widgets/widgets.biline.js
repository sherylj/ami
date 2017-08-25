import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';

/**
* @module widgets/bidirectional lines
*/


export default class WidgetBiline extends WidgetsBase {
  constructor(targetMesh, controls, camera, container, svgDiv) {
  	super();
    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;
    // this._context = context;
    this._svgDiv = svgDiv;

    this._active = true;

    this._worldPosition = new THREE.Vector3();
    if(this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // dom stuff
    this._biline = null;
    this._label = null;

    // dom stuff

    // canvas

    // add handles
    this._handles = [];

    // first handle
    let firstHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    firstHandle.worldPosition = this._worldPosition;
    firstHandle.hovered = true;
    this.add(firstHandle);

    this._handles.push(firstHandle);

    let secondHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    secondHandle.worldPosition = this._worldPosition;
    secondHandle.hovered = true;
    // active and tracking might be redundant
    secondHandle.active = true;
    secondHandle.tracking = true;
    this.add(secondHandle);

    let thirdHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    thirdHandle.worldPosition = this._worldPosition;
    let fourthHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    fourthHandle.worldPosition = this._worldPosition;

    this._handles.push(secondHandle);
    this._handles.push(thirdHandle);
    this._handles.push(fourthHandle);

    // create spline
    this.create();

    // event listeners
    this.onMove = this.onMove.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);
  }

  removeEventListeners() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);
  }

  onMove(evt) {
    this._dragged = true;
    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);
    this._handles[2].onMove(evt);
    this._handles[3].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._handles[2].hovered || this._handles[3].hovered;
    this.update();
  }

  onStart(evt) {
    this._dragged = false;

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);
    this._handles[2].onStart(evt);
    this._handles[3].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  onEnd(evt) {
    // First Handle
    this._handles[0].onEnd(evt);

    window.console.log(this);

    // Second Handle
    if(this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else{
      this._handles[1].tracking = false;
    }

    // State of ruler widget
    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  create() {
    // this.createMesh();
    this.createDOM();
  }

  createDOM() {
    let path = 'M' + this._handles[0].screenPosition.x + ',' +
    	this._handles[0].screenPosition.y + ' L' +
    	this._handles[0].screenPosition.x + 1 + ',' + this._handles[0].screenPosition.y + 1;
  	this._biline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  	this._biline.setAttribute('class', 'widgets orthogonal line');
    this._biline.setAttribute('fill', 'none');
    this._biline.setAttribute('stroke', '#40ffdf');
    this._biline.setAttribute('stroke-width', '1.85');
    // this._biline.setAttribute('d', path);
    this._svgDiv.appendChild(this._biline);
  }

  createPerpendicular() {
  	const x0 = this._handles[0].screenPosition.x;
  	const x1 = this._handles[1].screenPosition.x;

  	const y0 = this._handles[0].screenPosition.y;
  	const y1 = this._handles[1].screenPosition.y;

  	const dx = Math.abs(x1 - x0) / 2.0;
  	const dy = Math.abs(y1 - y0) / 2.0;

  	const cx = Math.min(x1, x0) + dx;
  	const cy = Math.min(y1, y0) + dy;

  	const xp = (x1 - x0) / 4.0;
  	const yp = (y1 - y0) / 4.0;


  	// let thirdHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
  	let screenPosition1 = {x: 0, y: 0, z: 0};
    screenPosition1.x = cx - yp;
  	screenPosition1.y = cy + xp;

  	// let fourthHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
  	let screenPosition2 = {x: 0, y: 0, z: 0};
  	screenPosition2.x = cx + yp;
  	screenPosition2.y = cy - xp;

  	let worldPosition1 = this._handles[2].worldPosition;
  	let worldPosition2 = this._handles[3].worldPosition;

  	const wdx = Math.abs(worldPosition1.x - worldPosition2.x) / 2.0;
  	const wdy = Math.abs(worldPosition1.y - worldPosition2.y) / 2.0;

  	const wcx = Math.min(worldPosition1.x, worldPosition2.x) + wdx;
  	const wcy = Math.min(worldPosition1.y, worldPosition2.y) + wdy;

  	const wxp = (worldPosition1.x - worldPosition2.x) / 4.0;
  	const wyp = (worldPosition1.y - worldPosition2.y) / 4.0;

  	worldPosition1.x = wcx - wyp;
  	worldPosition1.y = wcy + wxp;

  	worldPosition2.x = wcx + wyp;
  	worldPosition2.y = wcy - wxp;

  	this._handles[2].worldPosition = worldPosition1;
  	this._handles[3].worldPosition = worldPosition2;

  	/* if (this._handles.length === 2) {
  		this._handles.push(thirdHandle);
  		this._handles.push(fourthHandle);
  	} else if (this._handles.length === 4) {
  		this._handles.splice(2, 0, thirdHandle);
  		this._handles.splice(3, 0, fourthHandle);
  	}*/
  	let path = ' M' + screenPosition1.x + ',' + screenPosition1.y + ' L' + screenPosition2.x + ',' + screenPosition2.y;
  	return path;
  }

  update() {
    // this.updateColor();
    console.log('handles');
    // mesh stuff
    // this.updateMeshColor();
    // this.updateMeshPosition();

    const shortAxis = this.createPerpendicular();
    // DOM stuff
    this.updateDOMPosition(shortAxis);
    // this.updateDOMColor();
  }

  updateDOMPosition(shortAxis) {
    if (this._handles.length === 4) {
        let path = 'M' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y
        + ' L' + this._handles[1].screenPosition.x + ',' + this._handles[1].screenPosition.y;

        path += shortAxis;
        // this._spline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // this._spline.setAttribute('class', 'widgets spline');
        // this._spline.setAttribute('fill', 'none');
        // this._spline.setAttribute('stroke', '#40ffdf');
        // this._spline.setAttribute('stroke-width', '1.85');
        this._biline.setAttribute('d', path);
    }
  }

  set worldPosition(worldPosition) {
    this._worldPosition = worldPosition;
    this._handles[0].worldPosition = this._worldPosition;

    this._handles[1].worldPosition = this._worldPosition;

    this._handles[2].worldPosition = this._worldPosition;

    this._handles[3].worldPosition = this._worldPosition;

    this.update();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  updateMeshColor() {
    if(this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if(this._geometry) {
      this._geometry.verticesNeedUpdate = true;
    }
  }

  free() {
    // threejs stuff
    this.remove(this._mesh);

    // dom
    if (this._biline.parentNode == this._svgDiv) {
      this._svgDiv.removeChild(this._biline);
    }

    this._handles[0].free();
    this._handles[1].free();
    this._handles[2].free();
    this._handles[3].free();

    // event
    this.removeEventListeners();
  }
}
