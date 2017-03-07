// canvas
var canvas = document.getElementById('phase-space');
var ctx = canvas.getContext('2d');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var origin = {x:0.5*width, y:0.5*height};
var color = '#3DAA77';
// data
var N = 1000;
var sheets = [];
var sheetsBuffer = [];
var xrange = [0.0, 1.0];
// physics
var grav = 0.04;
var dt = 0.001;

// draw coordinate system
function coordsys(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y);
    ctx.moveTo(0, 0); ctx.lineTo(0, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#DEDEDE';
    ctx.stroke();
}


// Sheet class
function DMsheet1d(x, vx, ax=0, m=1) {
    // Constructs a 1D dark matter sheet with its phase-space coordinates
    var _this = this;
    this.x = x;
    this.vx = vx;
    this.ax = ax;
    this.m = m;
    var size = 5+m;
    // Drift half-step
    this.drift = function() {
        _this.x += _this.vx * 0.5*dt;
    };
    // Kick full-step
    this.kick = function() {
        _this.vx += _this.ax * dt;
    };
    // complete DKD step
    this.step = function() {
        _this.drift();
        _this.ax = force1d(_this);
        _this.kick();
        _this.drift();
    };
    // draw the sheets as points
    this.draw = function() {
        ctx.fillStyle = color;
        var xc = mapInterval(_this.x, xrange[0], xrange[1], 0.5*origin.x, 1.5*origin.x);
        var yc = mapInterval(_this.vx, 10.0, -10.0, 0, height);
        // remember that we're in phase-space
        ctx.fillRect(xc, yc, size, size);
    };
};

// 1-D force from Laplace equation
// m1 * a1 = G * m1 * m2 * sgn(x2-x1)
function force1d(sheet) {
    // calculate the force of sheet from sheets at index
    // index = sheets.findIndex(sheet);
    var a = 0;
    for (var i=0; i<N; i++) {
        a += grav*sheets[i].m*Math.sign(sheets[i].x-sheet.x);
    };
    return a;
};

// linear mapping of value from [A, B] > [a, b]
function mapInterval(val, A, B, a, b){
    return (val-A)*(b-a)/(B-A) + a;
};

// create sheets
function createSheets(i) {
    var x = mapInterval(i, 0, N, xrange[0], xrange[1]);
    var s = new DMsheet1d(x, 0.0);
    sheets.push(s);
}

// initiate sheets
function initiateSheets() {
    for (var i=0; i<N; i++) {
        //setTimeout(createSheets, 1, i);
        createSheets(i);
    };
};

// simulate and render
function render() {
    ctx.clearRect(0, 0, width, height);
    var sheetsBuffer = Array.from(sheets);
    for (var i=0; i<N; i++) {
        // evolve particles
        sheets[i].step();
        sheets[i].draw();
    };
    // log momentum conservation
    var conserv = 0
    for (var i=0; i<N; i++) {
        conserv += sheets[i].vx;
    }
    console.log(conserv);
    // redraw coordinate system
    coordsys(ctx);
    requestAnimationFrame(render);
};

// on resize
window.addEventListener('resize', resize);
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
};

// Main
initiateSheets();
render();
