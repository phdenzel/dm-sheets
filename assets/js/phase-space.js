// canvas
var canvas = $(document).getElementById('phase-space');
var ctx = canvas.getContext('2d');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var origin = {x:0.5*width, y:0.5*height}; // shifted from top left
var colors = {green:'#3DAA77', orange:'#FDB760', magenta:'#E83A82'};

// data & physics
var N = 1000;
var grav = 0.04;
var dt = 0.005;
var random_init = true;
var particles = [];
var xrange = [0.0, 1.0]; // used for initial conditions
var vrange = [10.0, -10.0]; // should simply cover the max/min velocity
var proj_x = {min:0.5*origin.x, max:1.5*origin.x}; // projected xrange
var proj_y = {min:0.0, max:height}; // projected vrange

// linear mapping of value from [A, B] > [a, b]
function mapInterval(val, A, B, a, b){
    return (val-A)*(b-a)/(B-A) + a;
};

// random number
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

// draw coordinate system
function coordsys(ctx) {
    ctx.strokeStyle = '#DEDEDE';
    ctx.fillStyle='#DEDEDE';
    ctx.font="16px Arial";
    // coordinate lines
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y);
    ctx.moveTo(proj_x.min, 0); ctx.lineTo(proj_x.min, height);
    ctx.lineWidth = 1;
    ctx.stroke();
    // axis labels
    ctx.fillText('0', proj_x.min-20, origin.y+20); // xmin
    ctx.fillText(xrange[1].toString(), proj_x.max, origin.y+20) // xmax
    ctx.fillText(vrange[0].toString(), proj_x.min-28, 20) // ymin
    ctx.fillText(vrange[1].toString(), proj_x.min-32, height-20) // ymin
};

// Particle class
function DMParticle1d(x, vx, ax=0, m=1, color=colors.green) {
    // Defaults
    // ax = typeof ax !== 'undefined' ? ax : 0;
    // m = typeof m !== 'undefined' ? m : 1;
    // color = typeof color !== 'undefined' ? color : colors.green;
    // Constructs a 1D dark matter particle with its phase-space coordinates
    var _this = this;
    this.x = x;
    this.vx = vx;
    this.ax = ax;
    this.m = m;
    this.color = color;
    this.size = Math.max(m/10, 5);
    // drift half-step
    this.drift = function() {
        _this.x += _this.vx * 0.5*dt;
    };
    // kick full-step
    this.kick = function() {
        _this.vx += _this.ax * dt;
    };
    // calculate acceleration for kick step
    this.potential = function() {
        _this.ax = force1d(_this);
    };
    // draw the particles as points
    this.draw = function() {
        ctx.fillStyle = _this.color;
        // remember that we're in phase-space
        var xc = mapInterval(_this.x, xrange[0], xrange[1],
                             proj_x.min, proj_x.max);
        var yc = mapInterval(_this.vx, vrange[0], vrange[1],
                             proj_y.min, proj_y.max);
        ctx.fillRect(xc, yc, _this.size, _this.size);
    };
};

// 1D force from Poisson equation
// m1 * a1 = G * m1 * m2 * sgn(x2-x1)
function force1d(p) {
    // calculate the force that particle p feels
    var a = 0;
    for (var i=0; i<N; i++) {
        // sign(0) should be 0
        a += grav*particles[i].m*Math.sign(particles[i].x-p.x);
    };
    return a;
};

// initial conditions
function createParticles() {
    // DM particles
    for (var i=0; i<N; i++) {
        // evenly spaced
        var x = mapInterval(i, 0, N, xrange[0], xrange[1]);
        if (random_init) { // small random perturbation in vx
            var p = new DMParticle1d(x, getRandomArbitrary(-0.01, 0.01));
        } else { // at rest, i.e. vx=0
            var p = new DMParticle1d(x, 0.0);
        }
        particles.push(p);
    };
};

function add_star() {
    // Star
    var s = new DMParticle1d(0.75, 0.1, 0.0, 50, colors.orange);
    console.log(s.m);
    particles.push(s);
    N += 1;
};

// evolves an array of particles
function evolve(particles) {
    // Drift
    for (var i=0; i<N; i++) {
        particles[i].drift();
    };
    // 1D Poisson equation
    for (var i=0; i<N; i++) {
        particles[i].potential();
    };
    // Kick
    for (var i=0; i<N; i++) {
        particles[i].kick();
    };
    // Drift
    for (var i=0; i<N; i++) {
        particles[i].drift();
    };
    // and project to canvas
    for (var i=0; i<N; i++) {
        particles[i].draw();
    };
};

// simulate and render
function render() {
    // clear screen
    ctx.clearRect(0, 0, width, height);
    // evolve and redraw
    evolve(particles);
    // log total momentum
    var conserv = 0
    for (var i=0; i<N; i++) {
        conserv += particles[i].vx*particles[i].m;
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
createParticles();
add_star();
render();
