import WidgetsBase from '../widgets/widgets.base';
import WidgetsHandle from '../widgets/widgets.handle';
import ModelsStack from '../models/models.stack';
import ModelsVoxel from '../models/models.voxel';
import PixelMap from '../helpers/helpers.pixelmap';

/**
 * @module widgets/handle
 *
 */
export default class WidgetsRuler extends WidgetsBase {
  constructor(stack, targetMesh, controls, camera, container) {
    super(container);

    this._stack = stack;
    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;

    this._active = true;
    this._lastEvent = null;

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
    this._line = null;
    this._distance = null;

    // add handles
    this._handles = [];

    // first handle
    let firstHandle =
      new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    firstHandle.worldPosition = this._worldPosition;
    firstHandle.hovered = true;
    this.add(firstHandle);

    this._handles.push(firstHandle);

    let secondHandle =
      new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    secondHandle.worldPosition = this._worldPosition;
    secondHandle.hovered = true;
    // active and tracking might be redundant
    secondHandle.active = true;
    secondHandle.tracking = true;
    this.add(secondHandle);

    this._handles.push(secondHandle);

    this._screenPosition =
      this.worldToScreen(this._worldPosition, this._camera, this._container);

    // Create ruler
    this.create();
    this.initOffsets();

    this.onMove = this.onMove.bind(this);
    this.onEndControl = this.onEndControl.bind(this);
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

  worldToScreen(worldCoordinate, camera, canvas) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(camera);

    screenCoordinates.x =
      Math.round((screenCoordinates.x + 1) * canvas.offsetWidth / 2);
    screenCoordinates.y =
      Math.round((-screenCoordinates.y + 1) * canvas.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
  }

  onMove(evt) {
    this._lastEvent = evt;
    this._dragged = true;

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered;
    this.update();
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

    // window.console.log(this);

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else {
      this._handles[1].tracking = false;
    }

    // State of ruler widget
    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  onEndControl() {
    if (!this._lastEvent) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.onMove(this._lastEvent);
    });

    this.updateLinePixels();
    this.updateDOMPosition();
  }

  create() {
    this.createMesh();
    this.createDOM();
    this.createVoxel();
  }

  createVoxel() {
    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
  }

  hideDOM() {
    this._line.style.display = 'none';
    this._distance.style.display = 'none';
    for (let index in this._handles) {
      this._handles[index].hideDOM();
    }
  }

  showDOM() {
    this._line.style.display = '';
    this._distance.style.display = '';
    for (let index in this._handles) {
      this._handles[index].showDOM();
    }
  }

  hideMesh() {
    this.visible = false;
  }

  showMesh() {
    this.visible = true;
  }

  show() {
    this.showDOM();
    this.showMesh();
  }

  hide() {
    this.hideDOM();
    this.hideMesh();
  }

  update() {
    this.updateColor();

    // update handles
    this._handles[0].update();
    this._handles[1].update();

    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  createMesh() {
    // geometry
    this._geometry = new THREE.Geometry();
    this._geometry.vertices.push(this._handles[0].worldPosition);
    this._geometry.vertices.push(this._handles[1].worldPosition);

    // material
    this._material = new THREE.LineBasicMaterial();
    this.updateMeshColor();

    // mesh
    this._mesh = new THREE.Line(this._geometry, this._material);
    this._mesh.visible = true;

    // add it!
    this.add(this._mesh);
  }

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if (this._geometry) {
      this._geometry.verticesNeedUpdate = true;
    }
  }

  createDOM() {
    // add line!
    this._line = document.createElement('div');
    this._line.setAttribute('id', this.uuid);
    this._line.setAttribute('class', 'AMI Widget Ruler');
    this._line.style.position = 'absolute';
    this._line.style.transformOrigin = '0 100%';
    this._line.style.marginTop = '-1px';
    this._line.style.height = '2px';
    this._line.style.width = '3px';
    this._container.appendChild(this._line);

    // add distance!
    this._distance = document.createElement('div');
    this._distance.setAttribute('class', 'widgets handle distance');
    this._distance.style.fontSize = '13px';
    this._distance.style.border = '2px solid';
    this._distance.style.backgroundColor = '#F9F9F9';
    // this._distance.style.opacity = '0.5';
    this._distance.style.color = '#353535';
    this._distance.style.padding = '4px';
    this._distance.style.position = 'absolute';
    this._distance.style.transformOrigin = '0 100%';
    this._distance.innerHTML = 'Hello, world!';
    this._container.appendChild(this._distance);

    this.updateDOMColor();
  }

  updateDOMPosition() {
    // update rulers lines and text!
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    // let x0 = x1 + (x2 - x1)/2;
    // let y0 = y1 + (y2 - y1)/2;
    let x0 = x2;
    let y0 = y2;

    if (y1 >= y2) {
      y0 = y2 - 70;
    } else {
      y0 = y2 + 70;
    }

    let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    this._line.style.transform = transform;
    this._line.style.width = `${length}px`;

    // update distance
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    if (this._pixelMap._stdDev) {
      this._distance.innerHTML =
      `Length: ${
        Math.sqrt(
          (w0.x-w1.x)*(w0.x-w1.x) +
          (w0.y-w1.y)*(w0.y-w1.y) +
          (w0.z-w1.z)*(w0.z-w1.z)
        ).toFixed(2)} mm <br />
        Mean: ${this._pixelMap._mean} <br />
        Min: ${this._pixelMap._min} <br />
        Max: ${this._pixelMap._max} <br />
        Std Dev: ${this._pixelMap._stdDev}`;
    } else {
      this._distance.innerHTML =
      `${
        Math.sqrt(
          (w0.x-w1.x)*(w0.x-w1.x) +
          (w0.y-w1.y)*(w0.y-w1.y) +
          (w0.z-w1.z)*(w0.z-w1.z)
        ).toFixed(2)} mm`;
    }

    let posY0 =
      y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
    x0 -= this._distance.offsetWidth/2;

    let transform2 =
      `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
    this._distance.style.transform = transform2;
  }

  updateDOMColor() {
    this._line.style.backgroundColor = `${this._color}`;
    this._distance.style.borderColor = `${this._color}`;
  }

  free() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);

    this._handles.forEach((h) => {
      h.free();
    });

    this._handles = [];

    this._container.removeChild(this._line);
    this._container.removeChild(this._distance);

    this.remove(this._mesh);

    super.free();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._worldPosition = worldPosition;
    this._handles[0].worldPosition = this._worldPosition;
    this._handles[1].worldPosition = this._worldPosition;

    this.update();
  }

  updateLinePixels() {
    const data = this.dataFromLineCanvas();
    // console.log(this._line.getBBox());
    const x1 = this._handles[0].screenPosition.x;
    const x2 = this._handles[1].screenPosition.x;
    const y1 = this._handles[0].screenPosition.y;
    const y2 = this._handles[1].screenPosition.y;
    let lowX = x1;
    let highX = x2;
    let lowY = y1;
    let highY = y2;
    if (x2 < x1) {
      lowX = x2;
      highX = x1;
    }
    if (y2 < y1) {
      lowY = y2;
      highY = y1;
    }
    // this.screenToWorld(this._handles[0].screenPosition, this._camera, this._container);
    this._voxel = new ModelsVoxel();
    for (let i = lowX; i <= highX; i++) {
      for (let j = lowY; j <= highY; j++) {
        if (data.data[parseInt(4 * (i + j * data.width) + 0)] === 255) {
          const screenCoordinate = new THREE.Vector3();
          screenCoordinate.x = i;
          screenCoordinate.y = j;
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
    }
    this._pixelMap.calculateMinMax();
    this._pixelMap.calculateTotalMean();
    this._pixelMap.calculateStandardDeviation();
  }

  screenToWorld(screenCoordinate, camera, canvas) {
    let worldCoordinates = screenCoordinate.clone();
    worldCoordinates.x = (screenCoordinate.x / canvas.offsetWidth) * 2 - 1;
    worldCoordinates.y = (-screenCoordinate.y / canvas.offsetHeight) * 2 + 1;
    worldCoordinates = worldCoordinates.unproject(camera);
    return worldCoordinates;
  }


  dataFromLineCanvas() {
    // console.log(this._container.offsetWidth); // columns
    // console.log(this._container.offsetHeight); // width
    // rows

    this._canvas = document.createElement('canvas');
    this._canvas.setAttribute('id', 'lineCanvas');
    this._canvas.setAttribute('width', this._container.offsetWidth);
    this._canvas.setAttribute('height', this._container.offsetHeight);
    let ctx = this._canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(this._handles[0].screenPosition.x, this._handles[0].screenPosition.y);
    ctx.lineTo(this._handles[1].screenPosition.x, this._handles[1].screenPosition.y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.fillStyle = 'rgba(255 ,0, 0, 1.0)';
    ctx.stroke();
    ctx.fill();

    return ctx.getImageData(0, 0, this._container.offsetWidth, this._container.offsetHeight);
  }
}
