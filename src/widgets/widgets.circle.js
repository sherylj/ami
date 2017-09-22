import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';
import ModelsStack from '../models/models.stack';
import ModelsVoxel from '../models/models.voxel';
import PixelMap from '../helpers/helpers.pixelmap';


/**
* @module widgets/circle
*/

export default class WidgetCircle extends WidgetsBase {
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
    this._lastEvent = null;

    this._worldPosition = new THREE.Vector3();
    if(this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // dom stuff
    this._circle = null;
    this._distance = null;

    // pixel map
    this._pixelMap = new PixelMap();

    // dom stuff
    // this._circle = null;
    this._radius = 3;
    this._segmentCount = 32;

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

    // create circle
    this.create();

    // event listeners
    this.onMove = this.onMove.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);

    this._controls.addEventListener('end', this.onEndControl);
  }

  removeEventListeners() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);
    this._controls.removeEventListener('end', this.onEndControl);
  }

  create() {
    this.createMesh();
    this.createDOM();
    this.createVoxel();
  }

  distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }

  angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  onStart(evt) {
    this._lastEvent = evt;
    this._dragged = false;

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  onEnd(evt) {
    this._lastEvent = evt;
    // First Handle
    this._handles[0].onEnd(evt);

    window.console.log(this);

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else {
      this._handles[1].tracking = false;
    }

    // State of circle widget
    this._active = this._handles[0].active || this._handles[1].active;
    this.updateCirclePixels();
    this.update();
  }

  onMove(evt) {
    this._lastEvent = evt;
    this._dragged = true;

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    // let dist = this.distanceBetween(this._handles[0].screenPosition, this._handles[1].screenPosition);
    // let angle = this.angleBetween(this._handles[0].screenPosition, this._handles[1].screenPosition);
    this._hovered = this._handles[0].hovered || this._handles[1].hovered;
    this._centerhover = this._handles[0].hovered;
    this.update();
  }

  onEndControl() {
    if (!this._lastEvent) {
      return;
    }

    console.log('this is the last last end control');
    window.requestAnimationFrame(() => {
      this.onMove(this._lastEvent);
    });
  }

  drawCircle(x, y) {
    this._context.beginPath();
    this._context.arc(x, y, 60, false, Math.PI * 2, false);
    this._context.closePath();
    this._context.fill();
    this._context.stroke();
  }

  update() {
    // general update
    this.updateColor();

    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMColor();
    this.updateDOMPosition();
  }//

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if (this._geometry) {
      this._geometry.verticesNeedUpdate=true;

      // let length = Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2);

      // this._radius = length;
    }
  }


  worldToScreen(worldCoordinate, camera, canvas) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(camera);

    screenCoordinates.x = Math.round((screenCoordinates.x + 1) * canvas.offsetWidth / 2);
    screenCoordinates.y = Math.round((-screenCoordinates.y + 1) * canvas.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
  }

  createVoxel() {
    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
  }

  createMesh() {
    // geometry

    // geometry
    this._geometry = new THREE.Geometry();
    this._geometry.vertices.push(this._handles[0].worldPosition);
    this._geometry.vertices.push(this._handles[1].worldPosition);

    // material
    this._material = new THREE.LineBasicMaterial();
    this.updateMeshColor();

    // mesh
    this._mesh = new THREE.Line(this._geometry, this._material);
    this._mesh.visible = false;

    // add it!
    this.add(this._mesh);
    /* this._geometry = new THREE.CircleGeometry(this._radius, this._segmentCount);

    // material
    this._material = new THREE.LineBasicMaterial();
    this.updateMeshColor();
    // mesh
    this._mesh = new THREE.Line(this._geometry, this._material);
    this._mesh.visible = true;

    // add it!
    this.add(this._mesh); */
  }

  createDOM() {
    // dom
     this._line = document.createElement('div');
    this._line.setAttribute('class', 'widgets circle');
    this._line.style.position = 'absolute';
    this._line.style.transformOrigin = '0 100%';
    this._line.style.marginTop = '-1px';
    this._line.style.height = '2px';
    // this._line.style.width = '3px';
    // this._container.appendChild(this._line);

    /* this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.setAttribute('width', this._svgDiv.clientWidth);
    this._svg.setAttribute('height', this._svgDiv.clientHeight);
    this._svg.setAttribute('version', '1.1'); */
    this._circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._circle.setAttribute('cx', this._handles[0].screenPosition.x);
    this._circle.setAttribute('cy', this._handles[0].screenPosition.y);
    this._circle.setAttribute('r', this._radius);
    this._circle.setAttribute('stroke', '#40ffdf');
    this._circle.setAttribute('stroke-width', 3);
    this._circle.setAttribute('fill', '#044B94');
    this._circle.setAttribute('fill-opacity', '0.0');
    // this._svg.appendChild(this._circle);
    this._svgDiv.appendChild(this._circle);
    /* this._context.beginPath();
    this._context.strokeStyle = 'rgb(123,0,123)';
    this._context.arc(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y, 3, 0, Math.PI * 2, true);
    this._context.stroke(); */

    // add distance!
    this._distance = document.createElement('div');
    this._distance.setAttribute('class', 'widgets circle radius');
    this._distance.style.fontSize = '13px';
    this._distance.style.border = '2px solid';
    this._distance.style.backgroundColor = '#F9F9F9';

    this._distance.style.color = '#353535';
    this._distance.style.padding = '4px';
    this._distance.style.position = 'absolute';
    this._distance.style.transformOrigin = '0 100%';
    this._distance.innerHTML = 'Hello, world!';
    this._container.appendChild(this._distance);

    this.updateDOMColor();
    // this._domStyles.circle();
    // this._domStyles.cross();
    /* this._dom.style.border = '2px solid';
    this._dom.style.backgroundColor = '#F9F9F9';
    this._dom.style.color = '#F9F9F9';
    this._dom.style.position = 'absolute';
    this._dom.style.width = '12px';
    this._dom.style.height = '12px';
    this._dom.style.margin = '-6px';
    this._dom.style.borderRadius = '50%';
    this._dom.style.transformOrigin = '0 100%';*/
  }

  updateDOMPosition() {
    // update rulers lines and text!
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    let x0 = x1 + (x2 - x1)/2;
    let y0 = y1 + (y2 - y1)/2;

    let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    if (this._handles[0]._active) {
      console.log('center is hovered');
      this._circle.setAttribute('cx', this._handles[0].screenPosition.x);
      this._circle.setAttribute('cy', this._handles[0].screenPosition.y);
      this._circle.setAttribute('r', this._radius);
      this._circle.setAttribute('stroke', '#40ffdf');
      this._circle.setAttribute('stroke-width', 3);
      this._circle.setAttribute('fill', '#044B94');
      this._circle.setAttribute('fill-opacity', '0.0');
    } else {
      this._circle.setAttribute('cx', this._handles[0].screenPosition.x);
      this._circle.setAttribute('cy', this._handles[0].screenPosition.y);
      this._circle.setAttribute('r', length);
      this._circle.setAttribute('stroke', '#40ffdf');
      this._circle.setAttribute('stroke-width', 3);
      this._circle.setAttribute('fill', '#044B94');
      this._circle.setAttribute('fill-opacity', '0.0');
      this._radius = length;
    }

    // this._radius = length;
    // this._line.style.transform = transform;
    // this._line.style.width = length;
    // this.clearCanvas(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y, length);
    // this._context.beginPath();
    // this._context.strokeStyle = 'rgb(123,0,123)';
    // this._context.arc(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y, length, 0, Math.PI * 2, true);
    // this._context.stroke();

    // this.drawCircle(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y);
    // this._line.style.height = length;

    // update distance
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    if (this._pixelMap._stdDev) {
      this._distance.innerHTML =
      `Radius: ${
        Math.sqrt((w0.x-w1.x)*(w0.x-w1.x)
          + (w0.y-w1.y)*(w0.y-w1.y)
          + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2)} mm <br />
        Mean: ${this._pixelMap._mean} <br />
        Min: ${this._pixelMap._min} <br />
        Max: ${this._pixelMap._max} <br />
        Std Dev: ${this._pixelMap._stdDev}`;
    } else {
      this._distance.innerHTML =
      `Radius : ${
        Math.sqrt((w0.x-w1.x)*(w0.x-w1.x)
          + (w0.y-w1.y)*(w0.y-w1.y)
          + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2)} mm`;
    }

    let posY0 = y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
    x0 -= this._distance.offsetWidth/2;

    // put the label on the top side of the line
    const labelx = this._handles[1].screenPosition.x;
    let labely = this._handles[1].screenPosition.y;

    let labelPosy = (labely - this._container.offsetHeight) + 10;

    let transform2 = `translate3D(${Math.round(labelx)}px,${Math.round(labelPosy)}px, 0)`;
    this._distance.style.transform = transform2;
  }

  updateDOMColor() {
    this._line.style.backgroundColor = `${this._color}`;
    this._distance.style.borderColor = `${this._color}`;
  }

  free() {
    // threejs stuff
    this.remove(this._mesh);


    // dom
    if (this._circle.parentNode == this._svgDiv) {
      this._svgDiv.removeChild(this._circle);
    }

    if (this._distance.parentNode == this._container) {
      this._container.removeChild(this._distance);
    }

    this._handles[0].free();
    this._handles[1].free();

    // event
    this.removeEventListeners();
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

  updateCirclePixels() {
    const data = this.dataFromCircleCanvas();

    const bbox = this._circle.getBBox();
    for (let x = bbox.x; x <= bbox.x + bbox.width + 1; x++) {
      for (let y = bbox.y; y <= bbox.y + bbox.height + 1; y++) {
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
    }
  }

  screenToWorld(screenCoordinate, camera, canvas) {
    let worldCoordinates = screenCoordinate.clone();
    worldCoordinates.x = (screenCoordinate.x / canvas.offsetWidth) * 2 - 1;
    worldCoordinates.y = (-screenCoordinate.y / canvas.offsetHeight) * 2 + 1;
    worldCoordinates = worldCoordinates.unproject(camera);
    return worldCoordinates;
  }

  dataFromCircleCanvas() {
    const START_ANGLE_RADANS = 0.0;
    const END_ANGLE_RADANS = 6.28318531;
    this._canvas = document.createElement('canvas');
    this._canvas.setAttribute('id', 'circleCanvas');
    this._canvas.setAttribute('width', this._container.offsetWidth);
    this._canvas.setAttribute('height', this._container.offsetHeight);
    let ctx = this._canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y, this._radius, START_ANGLE_RADANS, END_ANGLE_RADANS);
    ctx.strokeStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.fillStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.stroke();
    ctx.fill();

    return ctx.getImageData(0, 0, this._container.offsetWidth, this._container.offsetHeight);
  }
}
