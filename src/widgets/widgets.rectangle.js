import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';
import ModelsStack from '../models/models.stack';
import ModelsVoxel from '../models/models.voxel';
import PixelMap from '../helpers/helpers.pixelmap';

/**
* @module widgets/rectangle
*/

export default class WidgetRectangle extends WidgetsBase {
  constructor(stack, targetMesh, controls, camera, container, svgDiv) {
    super();

    this._stack = stack;
    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;
    // this._context = context;
    this._svgDiv = svgDiv;

    this._active = true;

    this._worldPosition = new THREE.Vector3();
    if (this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // pixel map
    this._pixelMap = new PixelMap();

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

  removeEventListeners() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);
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
    this.updateRectanglePixels();
    this.update();
  }

  create() {
    // this.createMesh();
    this.createDOM();
    this.createVoxel();
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
    this._rectangle.setAttribute('stroke', '#40ffdf');
    this._rectangle.setAttribute('stroke-width', '1.85');
    // this._rectangle.setAttribute('style', 'fill:none;stroke:blue;stroke-width:1.85');
    this._svgDiv.appendChild(this._rectangle);

    // this.updateDOMColor();

    // add label!
    this._label = document.createElement('div');
    this._label.setAttribute('class', 'rectangle label');
    this._label.style.fontSize = '13px';
    this._label.style.border = '2px solid';
    this._label.style.backgroundColor = '#F9F9F9';
    // this._distance.style.opacity = '0.5';
    this._label.style.color = '#353535';
    this._label.style.padding = '4px';
    this._label.style.position = 'absolute';
    this._label.style.transformOrigin = '0 100%';
    this._label.innerHTML = '';
    this._container.appendChild(this._label);
  }

  createVoxel() {
    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
  }

  free() {
    // threejs stuff

    // dom
    if (this._rectangle.parentNode == this._svgDiv) {
      this._svgDiv.removeChild(this._rectangle);
    }

    for(var i = 0; i < this._handles.length; i++) {
        this._handles[i].free();
    }

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
    this._rectangle.setAttribute('stroke', '#40ffdf');
    this._rectangle.setAttribute('stroke-width', '1.85');
    // this._rectangle.setAttribute('style', 'fill:none;stroke:#40ffdf;stroke-width:1.85');
  }

  updateDOMColor() {
    // this._line.style.backgroundColor = `${this._color}`;
    this._label.style.borderColor = `${this._color}`;
  }

  updateRectanglePixels() {
    const data = this.dataFromCanvas();
    const bbox = this._rectangle.getBBox();
    for (let x = bbox.x; x <= bbox.x + bbox.width + 1; x++) {
      for (let y = bbox.y; y <= bbox.y + bbox.height + 10; y++) {
        const r = parseInt(y);
        const c = parseInt(x);
        if (data.data[parseInt(4 * (c + r * data.width) + 0)] === 255) {
          const screenCoordinate = new THREE.Vector3();
          screenCoordinate.x = x;
          screenCoordinate.y = y;
          screenCoordinate.z = this._handles[0].screenPosition.z;
          this._voxel.worldCoordinates = this.screenToWorld(screenCoordinate, this._camera, this._container);
          // update data coordinates
          this._voxel.dataCoordinates = ModelsStack.worldToData(
                  this._stack,
                  this._voxel.worldCoordinates);
          // update value
          this._voxel.dataCoordinates.z = 0;
          let value = ModelsStack.value(
                  this._stack,
                  this._voxel.dataCoordinates);
          this._voxel.value = ModelsStack.valueRescaleSlopeIntercept(
                  value,
                  this._stack.rescaleSlope,
                  this._stack.rescaleIntercept);
          if (this._pixelMap.getPixelValue(this._voxel.value)) {
            this._pixelMap.addPixel(this._voxel.value, this._pixelMap.getPixelValue(this._voxel.value) + 1);
          } else {
            this._pixelMap.addPixel(this._voxel.value, 1);
          }
        }
      }
      this._pixelMap.calculateMinMax();
      this._pixelMap.calculateTotalMean();
      this._pixelMap.calculateStandardDeviation();

      this.addtoLabel();
    }
  }

  addtoLabel() {
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    let x0 = x2;
    let y0 = y2;

    if (y1 >= y2) {
      y0 = y2 - 50;
    } else {
      y0 = y2 + 50;
    }

    let posY0 =
      y0 - this._container.offsetHeight - this._label.offsetHeight/2;
      x0 -= this._label.offsetWidth/2;

    let transform2 =
      `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;

    this._label.style.transform = transform2;
    this._label.innerHTML = `Mean: ${this._pixelMap._mean} <br />
        Min: ${this._pixelMap._min} <br />
        Max: ${this._pixelMap._max} <br />
        Std Dev: ${this._pixelMap._stdDev}`;
  }

  screenToWorld(screenCoordinate, camera, canvas) {
    let worldCoordinates = screenCoordinate.clone();
    worldCoordinates.x = (screenCoordinate.x / canvas.offsetWidth) * 2 - 1;
    worldCoordinates.y = (-screenCoordinate.y / canvas.offsetHeight) * 2 + 1;
    worldCoordinates = worldCoordinates.unproject(camera);
    return worldCoordinates;
  }

  dataFromCanvas() {
    this._canvas = document.createElement('canvas');
    this._canvas.setAttribute('id', 'circleCanvas');
    this._canvas.setAttribute('width', this._container.offsetWidth);
    this._canvas.setAttribute('height', this._container.offsetHeight);
    let ctx = this._canvas.getContext('2d');
    const width = Math.abs(this._handles[0].screenPosition.x - this._handles[1].screenPosition.x);
    const height = Math.abs(this._handles[0].screenPosition.y - this._handles[1].screenPosition.y);
    ctx.beginPath();
    ctx.moveTo(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y);
    ctx.lineTo(this._handles[0].screenPosition.x + width, this._handles[0].screenPosition.y);
    ctx.lineTo(this._handles[0].screenPosition.x + width, this._handles[0].screenPosition.y - height);
    ctx.lineTo(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y - height);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.fillStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.stroke();
    ctx.fill();

    return ctx.getImageData(0, 0, this._container.offsetWidth, this._container.offsetHeight);
  }
}
