import WidgetsBase from '../../src/widgets/widgets.base';
import WidgetsHandle from '../../src/widgets/widgets.handle';
import CoreIntersections from '../../src/core/core.intersections';

/**
* @module widgets/circle
*/

export default class WidgetSpline extends WidgetsBase {
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
    this._spline = null;
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
    this.dragMouseUp = this.dragMouseUp.bind(this);
    this.dragMouseDown = this.dragMouseDown.bind(this);
    this.divMove = this.divMove.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);
    this._label.addEventListener('mousedown', this.dragMouseDown, false);
    this._label.addEventListener('mouseup', this.dragMouseUp, false);
  }

  removeEventListeners() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);
    this._label.removeEventListener('mousedown', this.dragMouseDown);
    this._label.removeEventListener('mouseup', this.dragMouseUp);
  }

  dragMouseUp() {
    this._label.removeEventListener('mousemove', this.divMove, true);
  }

  dragMouseDown(evt) {
    this._label.addEventListener('mousemove', this.divMove, true);
  }

  divMove(evt) {
    this._label.style.position = 'absolute';
    this._label.style.top = e.clientY + 'px';
    this._label.style.left = e.clientX + 'px';
  }

  distanceBetweenFirstPoint(firstPosition, newPosition) {
    const dx = Math.abs(firstPosition.x - newPosition.x);
    const dy = Math.abs(firstPosition.y - newPosition.y);

    const dist = {x: dx, y: dy};
    return dist;
  }

  // add another point to the spline
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
    // let newHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    // newHandle.worldPosition = true;
    // newHandle.hovered = true;
    // newHandle.onStart(evt);
    for(let i in this._handles) {
        this._handles[i].onStart(evt);
    }
    // this._handles.push(newHandle);

    // this._handles[0].onStart(evt);
    // this._handles[1].onStart(evt);

    // this._active = this._handles[0].active || this._handles[1].active;
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

    console.log('the spline is active or inactive : ' + this._active);
    /* if(this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else{
      this._handles[1].tracking = false;
    }*/

    // State of circle widget
    // this._active = this._handles[0].active || this._handles[1].active;
    // this.update();
  }

  onMove(evt) {
    this._dragged = true;
    console.log('spline moved');
    // this._handles[0].onMove(evt);
    // this._handles[1].onMove(evt);
    for(let i in this._handles) {
        this._handles[i].onMove(evt);
    }

    // let dist = this.distanceBetween(this._handles[0].screenPosition, this._handles[1].screenPosition);
    // let angle = this.angleBetween(this._handles[0].screenPosition, this._handles[1].screenPosition);
    // this._hovered = this._handles[0].hovered || this._handles[1].hovered;
    // this._centerhover = this._handles[0].hovered;
  }

  create() {
    // this.createMesh();
    this.createDOM();
  }

  createDOM() {
    // build path
    let path = 'M' + this._handles[0].screenPosition.x + ',' + this._handles[0].screenPosition.y;
    const line = this.splineInterpolation(this._handles);
    path = path + ' L' + line + 'Z';
    this._spline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._spline.setAttribute('class', 'widgets spline');
    this._spline.setAttribute('fill', 'none');
    this._spline.setAttribute('stroke', '#40ffdf');
    this._spline.setAttribute('stroke-width', '1.85');
    this._spline.setAttribute('d', path);
    this._svgDiv.appendChild(this._spline);

    // the label
    this._label = document.createElement('div');
    this._label.setAttribute('class', 'widgets spline area');
    this._label.setAttribute('draggable', true);
    this._label.style.border = '2px solid';
    this._label.style.backgroundColor = '#F9F9F9';
    this._label.style.color = '#353535';
    this._label.style.padding = '4px';
    this._label.style.position = 'absolute';
    this._label.style.transformOrigin = '0 100%';
    this._label.innerHTML = 'Area: ';
    this._container.appendChild(this._label);

    this.updateDOMColor();
  }

  free() {
    // threejs stuff

    // dom
    if (this._spline.parentNode == this._svgDiv) {
      this._svgDiv.removeChild(this._spline);
    }

    if (this._label.parentNode == this._container) {
        this._container.removeChild(this._label);
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
        const line = this.splineInterpolation(this._handles);
        path = path + ' L' + line + 'Z';
        // this._spline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // this._spline.setAttribute('class', 'widgets spline');
        // this._spline.setAttribute('fill', 'none');
        // this._spline.setAttribute('stroke', '#40ffdf');
        // this._spline.setAttribute('stroke-width', '1.85');
        this._spline.setAttribute('d', path);


        // label position
        this._label.innerHTML = 'Area: ';

        // put the label on the top side of the line
        const labelx = this._handles[1].screenPosition.x;
        let labely = this._handles[1].screenPosition.y;

        let labelPosy = (labely - this._container.offsetHeight) + 10;

        let transform2 = `translate3D(${Math.round(labelx)}px,${Math.round(labelPosy)}px, 0)`;
        this._label.style.transform = transform2;
    }
  }

  updateDOMColor() {
    this._spline.style.backgroundColor = `${this._color}`;
    this._label.style.borderColor = `${this._color}`;
  }

  splineInterpolation(coordList) {
    // NumberFormat df = NumberFormat.getFormat("000.000");

    // make a copy of the coordList
    let coords = [];
    for (let i = 0; i < coordList.length; i++) {
        // const handle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        // handle.screenPosition = coordList[i].screenPosition;
        coords.push(coordList[i].screenPosition);
    }

    let tot = coords.length;
    console.log('copy of coords ' + coords);
    console.log('coords lenght ' + tot);

    console.log('coords');
    console.log(coords[0]);
    // if input doesn't repeat the start point, we do it for you
    if (!(coords[0].x == coords[tot - 1].x &&
        coords[0].y == coords[tot - 1].y)) {
        // const handle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        // handle.screenPosition = coords[0].screenPosition;

        coords.push(coords[0]);
        tot = tot + 1;
    }

    let aax, bbx, ccx, ddx, aay, bby, ccy, ddy; // coef of spline

    // if( scale > 5) scale = 5;
    const scale = 1;
    //
    // // function spline S(x) = a x3 + bx2 + cx + d
    // // with S continue, S1 continue, S2 continue.
    // // smoothing of a closed polygon given by a list of points (x,y)
    // // we compute a spline for x and a spline for y
    // // where x and y are function of d where t is the distance
    // between points
    //
    // // compute tridiag matrix
    // // | b1 c1 0 ... | | u1 | | r1 |
    // // | a2 b2 c2 0 ... | | u2 | | r2 |
    // // | 0 a3 b3 c3 0 ... | * | ... | = | ... |
    // // | ... | | ... | | ... |
    // // | an-1 bn-1 cn-1 | | ... | | ... |
    // // | 0 an bn | | un | | rn |
    // // bi = 4
    // // resolution algorithm is taken from the book : Numerical
    // recipes in C
    //
    // // initialization of different vectors
    // // element number 0 is not used (except h[0])
    const nb = tot + 2;

    // a, c, cx, cy, d, g, gam, h, px, py = malloc(nb*sizeof(double));
    // BOOL failed = NO;
    //
    // Initialization
    const a = [];
    const c = [];
    const cx = [];
    const cy = [];
    const d = [];
    const g = [];
    const gam = [];
    const h = [];
    let px = [];
    let py = [];

    for (let i = 0; i < nb; i++) {
        cx[i] = 0.0;
        cy[i] = 0.0;
        a[i] = 0.0;
        c[i] = 0.0;
        d[i] = 0.0;
        g[i] = 0.0;
        gam[i] = 0.0;
        h[i] = 0.0;
        px[i] = 0.0;
        py[i] = 0.0;
    }

    /* double[] a = new double[nb];
    double[] c = new double[nb];
    double[] cx = new double[nb];
    double[] cy = new double[nb];
    double[] d = new double[nb];
    double[] g = new double[nb];
    double[] gam = new double[nb];
    double[] h = new double[nb];
    double[] px = new double[nb];
    double[] py = new double[nb];*/

    //
    // // as a spline starts and ends with a line one adds two points
    // // in order to have continuity in starting point
    // for (i=0; i<tot; i++)
    // {
    // px[i+1] = Pt[i].x;// * fZoom / 100;
    // py[i+1] = Pt[i].y;// * fZoom / 100;
    // }

    for (let i = 0; i < tot; i++) {
        px[i + 1] = coords[i].x;
        py[i + 1] = coords[i].y;
    }
    px[0] = px[nb - 3];
    py[0] = py[nb - 3];
    px[nb - 1] = px[2];
    py[nb - 1] = py[2];

    // px[0] = px[nb-3]; py[0] = py[nb-3];
    // px[nb-1] = px[2]; py[nb-1] = py[2];

    //
    // // check all points are separate, if not do not smooth
    // // this happens when the zoom factor is too small
    // // so in this case the smooth is not useful
    //
    // // define hi (distance between points) h0 distance between 0 and
    // 1.
    // // di distance of point i from start point
    let xi, yi;
    for (let i = 0; i < nb - 1; i++) {
        xi = px[i + 1] - px[i];
        yi = py[i + 1] - py[i];
        h[i] = Math.sqrt(xi * xi + yi * yi) * scale;
        d[i + 1] = d[i] + h[i];
    }

    //

    // define ai and ci
    for (let i = 2; i < nb - 1; i++)
        a[i] = 2.0 * h[i - 1] / (h[i] + h[i - 1]);
    for (let i = 1; i < nb - 2; i++)
        c[i] = 2.0 * h[i] / (h[i] + h[i - 1]);

    //
    // define gi in function of x
    // gi+1 = 6 * Y[hi, hi+1, hi+2],
    // Y[hi, hi+1, hi+2] = [(yi - yi+1)/(di - di+1) - (yi+1 -
    // yi+2)/(di+1 - di+2)]
    // / (di - di+2)
    for (let i = 1; i < nb - 1; i++)
        g[i] = 6.0 * (((px[i - 1] - px[i]) / (d[i - 1] - d[i])) - ((px[i] - px[i + 1]) / (d[i] - d[i + 1]))) / (d[i - 1] - d[i + 1]);

    // // compute cx vector
    let b, bet;
    b = 4;
    bet = 4;
    cx[1] = g[1] / b;
    for (let j = 2; j < nb - 1; j++) {
        gam[j] = c[j - 1] / bet;
        bet = b - a[j] * gam[j];
        cx[j] = (g[j] - a[j] * cx[j - 1]) / bet;
    }
    for (let j = (nb - 2); j >= 1; j--)
        cx[j] -= gam[j + 1] * cx[j + 1];

    // define gi in function of y
    // gi+1 = 6 * Y[hi, hi+1, hi+2],
    // Y[hi, hi+1, hi+2] = [(yi - yi+1)/(hi - hi+1) - (yi+1 -
    // yi+2)/(hi+1 - hi+2)]
    // / (hi - hi+2)
    for (let i = 1; i < nb - 1; i++)
        g[i] = 6.0 * (((py[i - 1] - py[i]) / (d[i - 1] - d[i])) - ((py[i] - py[i + 1]) / (d[i] - d[i + 1]))) / (d[i - 1] - d[i + 1]);

    //
    // compute cy vector
    b = 4.0;
    bet = 4.0;
    cy[1] = g[1] / b;
    for (let j = 2; j < nb - 1; j++) {
        gam[j] = c[j - 1] / bet;
        bet = b - a[j] * gam[j];
        cy[j] = (g[j] - a[j] * cy[j - 1]) / bet;
    }
    for (let j = (nb - 2); j >= 1; j--)
        cy[j] -= gam[j + 1] * cy[j + 1];

    // OK we have the cx and cy vectors, from that we can compute the
    // coeff of the polynoms for x and y and for each interval
    // S(x) (xi, xi+1) = ai + bi (x-xi) + ci (x-xi)2 + di (x-xi)3
    // di = (ci+1 - ci) / 3 hi
    // ai = yi
    // bi = ((ai+1 - ai) / hi) - (hi/3) (ci+1 + 2 ci)
    let tt = 0;
    let res = '';
    // for each interval
    for (let i = 1; i < nb - 2; i++) {
        // compute coef for x polynom
        ccx = cx[i];
        aax = px[i];
        ddx = (cx[i + 1] - cx[i]) / (3.0 * h[i]);
        bbx = ((px[i + 1] - px[i]) / h[i]) - (h[i] / 3.0)
                * (cx[i + 1] + 2.0 * cx[i]);

        // compute coef for y polynom
        ccy = cy[i];
        aay = py[i];
        ddy = (cy[i + 1] - cy[i]) / (3.0 * h[i]);
        bby = ((py[i + 1] - py[i]) / h[i]) - (h[i] / 3.0)
                * (cy[i + 1] + 2.0 * cy[i]);

        // compute points in this interval and display
        let p1x, p1y;
        p1x = aax;
        p1y = aay;

        // (*newPt)[tt]=p1;
        // res += String.format(" %6.4f %6.4f", p1x, p1y);
        // res += " " + df.format(p1x) + " " + df.format(p1y);
        // res += " " + Double.toString(p1x) + " " +
        // Double.toString(p1y);
        res += ' ' + p1x + ',' + p1y;

        tt = tt + 1;

        for (let j = 1; j <= h[i]; j++) {
            let p2x, p2y;
            p2x = (aax + bbx * j + ccx * (j * j) + ddx
                    * (j * j * j));
            p2y = (aay + bby * j + ccy * (j * j) + ddy
                    * (j * j * j));
            // (*newPt)[tt]=p2;
            // res += String.format(" %6.4f %6.4f", p2x, p2y);
            // res += " " + df.format(p2x) + " " + df.format(p2y);
            // res += " " + Double.toString(p2x) + " " +
            // Double.toString(p2y);
            res += ' ' + p2x + ',' + p2y;

            tt = tt + 1;
        }// endfor points in 1 interval
    }// endfor each interval
        // *newPt = calloc(totNewPt, sizeof(NSPoint));
    return res;
    }

    get closedShape() {
      return this._closedShape;
    }

    set closedShape(closedShape) {
      this._closedShape = closedShape;
    }

}
