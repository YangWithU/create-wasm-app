import * as sim from "lib-simulation-wasm";

// wasm.greet();

// alert("I'm js and going to call Rust dodo(): [ " + sim.dodo() + " ]");
const simulation = new sim.Simulation();

// for (const animal of world.animals) {
//     console.log(animal.x, animal.y);
// }

const viewport = document.getElementById('viewport');

//----------修正canvas模糊,分辨率错误的问题-------

const viewportWidth = viewport.width;
const viewportHeight = viewport.height;

const viewportScale = window.devicePixelRatio || 1;
// ------------------------------------------ ^^^^
// | Syntax-wise, it's like: .unwrap_or(1)
// |
// | This value determines how much physical pixels there are per
// | each single pixel on a canvas.
// |
// | Non-HiDPI displays usually have a pixel ratio of 1.0, which
// | means that drawing a single pixel on a canvas will lighten-up
// | exactly one physical pixel on the screen.
// |
// | My display has a pixel ratio of 2.0, which means that for each
// | single pixel drawn on a canvas, there will be two physical
// | pixels modified by the browser.
// ---

// The Trick, part 1: we're scaling-up canvas' *buffer*, so that it
// matches the screen's pixel ratio
viewport.width = viewportWidth * viewportScale;
viewport.height = viewportHeight * viewportScale;

// The Trick, part 2: we're scaling-down canvas' *element*, because
// the browser will automatically multiply it by the pixel ratio in
// a moment.
//
// This might seem like a no-op, but the maneuver lies in the fact
// that modifying a canvas' element size doesn't affect the canvas'
// buffer size, which internally *remains* scaled-up:
//
// ----------- < our entire page
// |         |
// |   ---   |
// |   | | < | < our canvas
// |   ---   |   (size: viewport.style.width & viewport.style.height)
// |         |
// -----------
//
// Outside the page, in the web browser's memory:
//
// ----- < our canvas' buffer
// |   | (size: viewport.width & viewport.height)
// |   |
// -----
viewport.style.width = viewportWidth + 'px';
viewport.style.height = viewportHeight + 'px';

const ctxt = viewport.getContext('2d');

// Automatically scales all operations by `viewportScale` - otherwise
// we'd have to `* viewportScale` everything by hand
ctxt.scale(viewportScale, viewportScale);


// ---
// | Determines color of the upcoming shape.
// - v-------v
// ctxt.fillStyle = 'rgb(255, 0, 0)';
//   ------------------ ^-^ -^ -^
//   | Each of those three parameters is a number from range 0 up to 255:
//   |
//   | rgb(0, 0, 0) = black
//   |
//   | rgb(255, 0, 0) = red
//   | rgb(0, 255, 0) = green
//   | rgb(0, 0, 255) = blue
//   |
//   | rgb(255, 255, 0) = yellow
//   | rgb(0, 255, 255) = cyan
//   | rgb(255, 0, 255) = magenta
//   |
//   | rgb(128, 128, 128) = gray
//   | rgb(255, 255, 255) = white
//   ---
ctxt.fillStyle = 'rgb(0, 0, 0)';



//ctxt.fillRect(10, 10, 100, 50);
//   ---------- X   Y   W    H
//   | Draws rectangle filled with color determined by `fillStyle`.
//   |
//   | X = position on the X axis (left-to-right)
//   | Y = position on the Y axis (top-to-bottom)
//   | W = width
//   | X = height
//   |
//   | (unit: pixels)
//   ---


// ---
// | The type of our `ctxt`.
// v------------------ v
CanvasRenderingContext2D.prototype.drawTriangle =
    function (x, y, size, rotation) {
        this.beginPath();
        this.moveTo(
            x - Math.sin(rotation) * size * 1.5,
            y + Math.cos(rotation) * size * 1.5
        );
        this.lineTo(
            x - Math.sin(rotation + 2.0 / 3.0 * Math.PI) * size,
            y + Math.cos(rotation + 2.0 / 3.0 * Math.PI) * size,
        );
        this.lineTo(
            x - Math.sin(rotation + 4.0 / 3.0 * Math.PI) * size,
            y + Math.cos(rotation + 4.0 / 3.0 * Math.PI) * size,
        );
        this.lineTo(
            x - Math.sin(rotation) * size * 1.5,
            y + Math.cos(rotation) * size * 1.5,
        );

        this.fillStyle = 'rgb(255, 255, 255)'; // A nice white color
        this.fill();
        this.stroke();
    };


CanvasRenderingContext2D.prototype.drawCircle =
    function (x, y, radius) {
        this.beginPath();

        this.arc(x, y, radius, 0, 2.0 * Math.PI);
        // ------------------- ^ -^-----------^
        // | Range at which the circle starts and ends, in radians.
        // |
        // | By manipulating these two parameters you can e.g. draw
        // | only half of a circle, Pac-Man style.
        // ---

        this.fillStyle = 'rgb(0, 255, 128)'; // A nice green color
        this.fill();
    };


document.getElementById('train').onclick = function () {
    console.log(simulation.train())
}

function redraw() {
    ctxt.clearRect(0, 0, viewportWidth, viewportHeight);

    // rust code, upd bird position with speed
    simulation.step();

    const world = simulation.world();

    // draw foods, circle
    for (const food of world.foods) {
        ctxt.drawCircle(
            food.x * viewportWidth,
            food.y * viewportHeight,
            (0.01 / 2.0) * viewportWidth,
        )
    }

    // draw birds
    for (const animal of world.animals) {
        ctxt.drawTriangle(
            animal.x * viewportWidth,
            animal.y * viewportHeight,
            0.01 * viewportWidth,
            animal.rotation
        );
    }

    // requestAnimationFrame() schedules code only for the next frame.
    //
    // Because we want for our simulation to continue forever, we've
    // gotta keep re-scheduling our function:
    requestAnimationFrame(redraw);
}

// ------- render part ----------
redraw();


