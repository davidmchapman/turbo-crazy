import { Ball } from './ball.js';
import { PathNode } from './path-node.js';
import { Vector } from './vector.js';

let c;
let ctx;
let cRect;
let bgSlider;

let secondsPassed;
let oldTimestamp;
let fps;

let bgValue;

let nodes = [];
let balls = [];

let ballColor = [0, 95, 115, 0.5];
let showPath = true;

document.addEventListener('DOMContentLoaded', (event) => {

    window.scrollTo(0, 0);

    c = document.getElementById('game');
    ctx = c.getContext('2d');
    cRect = c.getBoundingClientRect();
    bgSlider = document.getElementById("bg-slider");

    window.addEventListener('keyup', checkKey);
    c.addEventListener('click', canvasClicked, false);
    bgSlider.addEventListener('input', bgSliderInput, false);
    bgValue = bgSlider.value;

    window.addEventListener('keydown', (e) => {  
        if (e.keyCode === 32 && e.target === document.body) {  
          e.preventDefault();  
        }  
      });

    document.getElementById('swatch_005f73').addEventListener('click', e => { ballColor = [0, 95, 115, 1] }, false);
    document.getElementById('swatch_0a9396').addEventListener('click', e => { ballColor = [10, 147, 150, 1] }, false);
    document.getElementById('swatch_94d2bd').addEventListener('click', e => { ballColor = [148, 210, 189, 1] }, false);
    document.getElementById('swatch_e9d8a6').addEventListener('click', e => { ballColor = [233, 216, 166, 1] }, false);
    document.getElementById('swatch_ee9b00').addEventListener('click', e => { ballColor = [238, 155, 0, 1] }, false);
    document.getElementById('swatch_ca6702').addEventListener('click', e => { ballColor = [202, 103, 2, 1] }, false);
    document.getElementById('swatch_bb3e03').addEventListener('click', e => { ballColor = [187, 62, 3, 1] }, false);
    document.getElementById('swatch_ae2012').addEventListener('click', e => { ballColor = [174, 32, 18, 1] }, false);
    document.getElementById('swatch_f72585').addEventListener('click', e => { ballColor = [247, 37, 133, 1] }, false);
    document.getElementById('swatch_b5179e').addEventListener('click', e => { ballColor = [181, 23, 158, 1] }, false);
    document.getElementById('swatch_7209b7').addEventListener('click', e => { ballColor = [114, 9, 183, 1] }, false);
    document.getElementById('swatch_560bad').addEventListener('click', e => { ballColor = [86, 11, 173, 1] }, false);
    document.getElementById('swatch_3f37c9').addEventListener('click', e => { ballColor = [63, 55, 201, 1] }, false);
    document.getElementById('swatch_4361ee').addEventListener('click', e => { ballColor = [67, 97, 238, 1] }, false);

    window.requestAnimationFrame(gameLoop);
});

function checkKey(e) {
    e.preventDefault();

    switch (e.keyCode) {
        case 32: // spacebar
            balls.push(new Ball(4, ballColor))
            break;

        case 72: // h key
            showPath = !showPath;
            break;

        default:
            break;
    }

    return false;
}

function canvasClicked(e) {
    let x = e.clientX + window.scrollX - Math.round(cRect.x) - 1;
    let y = e.clientY + window.scrollY - Math.round(cRect.y) - 3;

    addToNodes(x, y);
}

function bgSliderInput(e) {
    bgValue = e.target.value;
}

function gameLoop(timestamp) {
    // calculate the number of seconds passed since the last frame
    secondsPassed = (timestamp - oldTimestamp) / 1000;
    oldTimestamp = timestamp;

    // calculate fps
    fps = Math.round(1 / secondsPassed);

    draw();
    window.requestAnimationFrame(gameLoop);
}

function addToNodes(x, y) {

    let priorNode = nodes.at(-1);
    if (priorNode === undefined) {
        nodes.push(new PathNode(x, y, true));
        return;
    }

    // need to push a set of interpolated points to the nodes list
    let priorNodeVector = new Vector(priorNode.x, priorNode.y);
    let newNodeVector = new Vector(x, y);
    let distance = Vector.distance(priorNodeVector, newNodeVector);
    let direction = Vector.subtract(newNodeVector, priorNodeVector).normalize();
    let currentPosition = priorNodeVector.clone();

    while (true) {
        currentPosition = Vector.multiply(direction, 16).add(currentPosition);

        if (Vector.distance(priorNodeVector, currentPosition) < distance) {
            nodes.push(new PathNode(currentPosition.x, currentPosition.y, false));
        } else {
            nodes.push(new PathNode(x, y, true));
            break;
        }
    }
}

function draw() {
    
    updateBgColor();
    drawFps();
    drawNodes();
    drawBalls();
}

function updateBgColor() {
    ctx.fillStyle = "rgb(" + bgValue + ", " + bgValue + ", " + bgValue + ")";
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawFps() {
    // draw fps box to the screen
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 48, 14);
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText("FPS: " + fps, 2, 12);
}

function drawNodes() {
    let nodeColor = Math.abs(bgValue - 255);
    
    if (!showPath) {
        nodeColor = bgValue;
    }
    
    ctx.fillStyle = "rgb(" + nodeColor + ", " + nodeColor + ", " + nodeColor + ")";

    nodes.forEach(n => {
        let dim = 1;

        if (n.isAnchor) {
            dim = 4;
        }

        ctx.fillRect(n.x - Math.round(dim / 2), n.y - Math.round(dim / 2), dim, dim);
    });
}

function drawBalls() {
    let maxNodeIndex = nodes.length - 1;

    if (maxNodeIndex === -1) {
        return;
    }

    balls.forEach(b => {
        let newIndex = b.pathNodeIndex >= maxNodeIndex ? 0 : b.pathNodeIndex + 1;
        b.pathNodeIndex = newIndex;
        let node = nodes[newIndex];

        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(" + b.rgbaArray[0] + ", " + b.rgbaArray[1] + ", " + b.rgbaArray[2] + ", " + b.rgbaArray[3] + ")";
        ctx.fill();
    });
}
