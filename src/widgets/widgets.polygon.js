import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';

/**
* @module widgets/polygon
*/

export default class WidgetPolygon extends WidgetsBase {
	constructor(targetMesh, controls, camera, container, svgDiv) {
    super();

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;
    // this._context = context;
    this._svgDiv = svgDiv;

    this._active = true;
    this._closedShape = false;

    this._worldPosition = new THREE.Vector3();
    if(this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // dom stuff
    this._polygon = null;
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

    // let secondHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    // secondHandle.worldPosition = this._worldPosition;
    // secondHandle.hovered = true;
    // active and tracking might be redundant
    // secondHandle.active = true;
    // secondHandle.tracking = true;
    // this.add(secondHandle);

    // this._handles.push(secondHandle);

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

  distanceBetweenFirstPoint(firstPosition, newPosition) {
    const dx = Math.abs(firstPosition.x - newPosition.x);
    const dy = Math.abs(firstPosition.y - newPosition.y);

    const dist = {x: dx, y: dy};
    return dist;
  }

  // add another point to the polygon
  onMouseDown(evt, worldPosition) {
    for (let i in this._handles) {
        if (this._handles[i].dragged) {
            this.update();
            return;
        }
    }
    const diff = this.distanceBetweenFirstPoint(this._handles[0].worldPosition, worldPosition);
    console.log('difference from first');
    console.log(diff);
    if (diff.x <= 8.0 && diff.y <= 8.0) {
        let path = 'M' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y;
        for(let i=1; i < this._handles.length; i++) {
            path += 'L' + this._handles[i].screenPosition.x + ',' + this._handles[i].screenPosition.y;
        }
        path += 'L' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y+'Z';
        this._polygon.setAttribute('d', path);
        this.onEnd(evt);
    } else {
        let newHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        newHandle.worldPosition = true;
        newHandle.worldPosition = worldPosition;
        // newHandle.worldPosition = this._worldPosition;
        // newHandle.hovered = true;
        // newHandle.onStart(evt);
        this.add(newHandle);
        this._handles.push(newHandle);
        this.onStart(evt);
    }
    // this.update();
  }

  onMouseUp(evt) {
    for(let i in this._handles) {
        /* if(this._dragged || !this._handles[i].tracking) {
            this._handles[i].tracking = false;
            this._handles[i].onEnd(evt);
        } else{*/
        this._handles[i].tracking = false;
        // this._handles[i].onEnd(evt);
        // }
    }
  }

  onStart(evt) {
    this._dragged = false;

    for(let i in this._handles) {
        this._handles[i].onStart(evt);
    }
    this.update();
  }

  onEnd(evt) {
    // First Handle
    this._handles[0].onEnd(evt);

    window.console.log(this);
    this._active = this._handles[0].active;

    // Second Handle
    for (let i = 1; i < this._handles.length; i++) {
        if (this._dragged || !this._handles[i].tracking) {
            this._handles[i].tracking = false;
            this._handles[i].onEnd(evt);
        } else {
            this._handles[i].tracking = false;
        }
        this._active = this._active || this._handles[i].active;
    }

    console.log('the polygon is active or inactive : ' + this._active);
  }

  onMove(evt) {
    this._dragged = true;
    console.log('polygon moved');
    // this._handles[0].onMove(evt);
    // this._handles[1].onMove(evt);
    for(let i in this._handles) {
        this._handles[i].onMove(evt);
    }
  }

  create() {
    // this.createMesh();
    this.createDOM();
  }

  createDOM() {
    // build path
        let path = 'M' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y;
        for(let i=1; i < this._handles.length; i++) {
        	path += 'L' + this._handles[i].screenPosition.x + ',' + this._handles[i].screenPosition.y;
        }
        // path = path + 'Z';
        this._polygon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this._polygon.setAttribute('class', 'widgets polygon');
        this._polygon.setAttribute('fill', 'none');
        this._polygon.setAttribute('stroke', '#40ffdf');
        this._polygon.setAttribute('stroke-width', '1.85');
        this._polygon.setAttribute('d', path);
        this._svgDiv.appendChild(this._polygon);
  }


  free() {
    // threejs stuff

    // dom
    if (this._polygon.parentNode == this._svgDiv) {
      this._svgDiv.removeChild(this._polygon);
    }

    for(var i = 0; i < this._handles.length; i++) {
        this._handles[i].free();
    }

    // event
    this.removeEventListeners();
  }

  update() {
    // this.updateColor();
    console.log('handles');
    console.log(this._handles);
    // mesh stuff
    // this.updateMeshColor();
    // this.updateMeshPosition();

    // DOM stuff
    this.updateDOMPosition();
    // this.updateDOMColor();
  }

  set worldPosition(worldPosition) {
    this._worldPosition = worldPosition;
    this._handles[0].worldPosition = this._worldPosition;

    // this._handles[1].worldPosition = this._worldPosition;

    // this.update();
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

  updateDOMPosition() {
    if (this._handles.length >= 2) {
        let path = 'M' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y;
        
        for(let i=1; i < this._handles.length; i++) {
        	path += 'L' + this._handles[i].screenPosition.x + ',' + this._handles[i].screenPosition.y;
        }
        // path = path + 'Z';
        // this._spline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // this._spline.setAttribute('class', 'widgets spline');
        // this._spline.setAttribute('fill', 'none');
        // this._spline.setAttribute('stroke', '#40ffdf');
        // this._spline.setAttribute('stroke-width', '1.85');
        this._polygon.setAttribute('d', path);
    }
  }

  get closedShape() {
    return this._closedShape;
  }

  set closedShape(closedShape) {
    this._closedShape = closedShape;
  }

}
