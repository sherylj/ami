import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';

/**
* @module widgets/rectangle
*/

export default class WidgetRectangle extends WidgetsBase {
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
    this._rectangle = null;
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

    this._handles.push(secondHandle);

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

  onMove(evt) {
    this._dragged = true;

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered;
    this.update();
  }

  onStart(evt) {
    this._dragged = false;

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

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
    // add line!
    // const width = Math.abs(this._handles[0].screenPosition.x - this._handles[1].screenPosition.x);
    // const height = Math.abs(this._handles[0].screenPosition.y - this._handles[1].screenPosition.y);

    this._rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this._rectangle.setAttribute('class', 'widgets handle rectangle');
    this._rectangle.setAttribute('width', '2px');
    this._rectangle.setAttribute('height', '1px');
    this._rectangle.setAttribute('fill', 'none');
    this._rectangle.setAttribute('stroke', 'blue');
    this._rectangle.setAttribute('stroke-width', '1.85');
    // this._rectangle.setAttribute('style', 'fill:none;stroke:blue;stroke-width:1.85');
    this._svgDiv.appendChild(this._rectangle);

    // this.updateDOMColor();
  }

  free() {
    // threejs stuff

    // dom

    // event
    this.removeEventListeners();
  }

  update() {
    // this.updateColor();
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

    this._handles[1].worldPosition = this._worldPosition;

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

  updateDOMPosition() {
    const width = Math.abs(this._handles[0].screenPosition.x - this._handles[1].screenPosition.x);
    const height = Math.abs(this._handles[0].screenPosition.y - this._handles[1].screenPosition.y);
    this._rectangle.setAttribute('width', width);
    this._rectangle.setAttribute('height', height);
    this._rectangle.setAttribute('x', this._handles[0].screenPosition.x);
    this._rectangle.setAttribute('y', this._handles[0].screenPosition.y);
    this._rectangle.setAttribute('fill', 'none');
    this._rectangle.setAttribute('stroke', 'blue');
    this._rectangle.setAttribute('stroke-width', '1.85');
    // this._rectangle.setAttribute('style', 'fill:none;stroke:#40ffdf;stroke-width:1.85');
  }

}
