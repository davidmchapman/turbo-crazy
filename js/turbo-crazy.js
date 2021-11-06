import { Ball } from './ball.js';
import { Path } from './path.js';
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

let paths = new Map();

let ballColor = [247, 37, 133, 1];
let showPath = true;

let activePath = 1;

document.addEventListener('DOMContentLoaded', (event) => {

    window.scrollTo(0, 0);

    let clientWidth = document.body.clientWidth;

    if (clientWidth < 1000) {
        alert('Please make your browser window wider and reload the page.');
        return;
    }

    c = document.getElementById('canvas');
    ctx = c.getContext('2d');

    ctx.canvas.width = clientWidth;

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

    let pathDivs = document.getElementsByClassName('path');

    for (let div of pathDivs) {
        div.addEventListener('click', switchActivePath);
    }

    let undoSpans = document.getElementsByClassName('undo');

    for (let span of undoSpans) {
        span.addEventListener('click', removeNode);
    }

    let redoSpans = document.getElementsByClassName('redo');

    for (let span of redoSpans) {
        span.addEventListener('click', undoRemoveNode);
    }

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

    // initialize the paths map with 10 paths
    for (let pathNumber = 1; pathNumber <= 10; pathNumber++) {
        paths.set(pathNumber, new Path())
    }

    window.requestAnimationFrame(gameLoop);
});

function checkKey(e) {
    e.preventDefault();

    switch (e.keyCode) {
        case 32: // spacebar
            let path = paths.get(activePath);
            let ball = new Ball(4, ballColor);

            // Don't add the ball to the path if it would 
            // occupy the same node as another equal ball.
            // You can only see one ball at each node.
            let found = false;

            for (let i = 0; i < path.balls.length; i++) {
                if (path.balls[i].pathNodeIndex === 0) {
                    found = true;

                    if (!path.balls[i].equals(ball)) {
                        path.balls[i] = ball;
                    }
                }
            }

            if (!found) {
                path.balls.push(ball);
            }

            break;

        case 72: // h key
            showPath = !showPath;
            break;

        case 48: // 0 key
            document.getElementById('path-10').click();
            break;

        case 49: // 1 key
            document.getElementById('path-1').click();
            break;

        case 50: // 2 key
        document.getElementById('path-2').click();
            break;

        case 51: // 3 key
        document.getElementById('path-3').click();
            break;

        case 52: // 4 key
        document.getElementById('path-4').click();
            break;

        case 53: // 5 key
        document.getElementById('path-5').click();
            break;

        case 54: // 6 key
        document.getElementById('path-6').click();
            break;

        case 55: // 7 key
        document.getElementById('path-7').click();
            break;

        case 56: // 8 key
        document.getElementById('path-8').click();
            break;

        case 57: // 9 key
        document.getElementById('path-9').click();
            break;

        default:
            break;
    }

    return false;
}

function switchActivePath(e) {
    window.getSelection().removeAllRanges();

    let pathNumber = parseInt(e.currentTarget.id.split('-')[1]);
    let clickedElement = e.target;

    if (activePath === pathNumber) {
        if (clickedElement.classList.contains('path-gear')) {
            let settingsDiv = document.getElementById('path-' + activePath + '-settings');

            if (settingsDiv.style.display === 'none') {
                settingsDiv.style.display = 'block';
            } else {
                settingsDiv.style.display = 'none';
            }
        }

        return;
    }
    
    activePath = pathNumber;

    let pathDivs = document.getElementsByClassName('path');

    for (let div of pathDivs) {
        div.classList.remove('selected-path');
    }

    let pathGearSpans = document.getElementsByClassName('path-gear');

    for (let span of pathGearSpans) {
        span.style.removeProperty('background-color');
        span.style.removeProperty('color');
    }

    let pathSettingsDivs = document.getElementsByClassName('path-settings');

    for (let div of pathSettingsDivs) {
        div.style.display = "none";
    }

    let activePathGearSpan = document.getElementById('path-' + activePath + '-gear');
    activePathGearSpan.style.backgroundColor = 'white';
    activePathGearSpan.style.color = 'black';

    document.getElementById('path-' + activePath).classList.add('selected-path');

    if (clickedElement.classList.contains('path-gear')) {
        let settingsDiv = document.getElementById('path-' + activePath + '-settings');
        settingsDiv.style.display = "block";
    }
}

function canvasClicked(e) {
    let x = e.clientX + window.scrollX - Math.round(cRect.x) - 1;
    let y = e.clientY + window.scrollY - Math.round(cRect.y) - 3;

    let path = paths.get(activePath);
    
    path.redo = [];
    addToNodes(path, x, y);
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

function addToNodes(path, x, y) {

    let priorNode = path.nodes.at(-1);
    if (priorNode === undefined) {
        path.nodes.push(new PathNode(x, y, true));
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
            path.nodes.push(new PathNode(currentPosition.x, currentPosition.y, false));
        } else {
            path.nodes.push(new PathNode(x, y, true));
            break;
        }
    }
}

function removeNode() {

    let path = paths.get(activePath);
    let lastNode = path.nodes.pop();
    path.redo.push(lastNode);

    // also need to remove all the other
    // node up to the now-last anchor node
    if (path.nodes.length > 0) {
        while (!path.nodes.at(-1).isAnchor) {
            path.nodes.pop();
        }
    }

    for (let i = path.balls.length - 1; i >= 0; i--) {
        if (path.balls[i].pathNodeIndex > path.nodes.length) {
            path.balls.splice(i, 1);
        }
    }
}

function undoRemoveNode() {

    let path = paths.get(activePath);
    let node = path.redo.pop();

    if (node !== undefined) {
        addToNodes(path, node.x, node.y);
    }
}

function draw() {
    
    drawBackground();
    drawFps();
    drawPaths();
}

function drawBackground() {
    ctx.fillStyle = "rgb(" + bgValue + ", " + bgValue + ", " + bgValue + ")";
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawFps() {
    let fpsDiv = document.getElementById('fps');
    fpsDiv.innerHTML = 'FPS: ' + fps;
}

function drawPaths() {
    for (const [pathNumber, path] of paths) {
        drawPathNodes(pathNumber, path);
        drawPathBalls(path);
    }
}

function drawPathNodes(pathNumber, path) {
    let nodeColor = Math.abs(bgValue - 255);
    
    if (!showPath) {
        nodeColor = bgValue;
    }
    
    ctx.fillStyle = "rgb(" + nodeColor + ", " + nodeColor + ", " + nodeColor + ")";

    let maxNodeIndex = path.nodes.length - 1;

    path.nodes.forEach((n, i) => {
        if (!n.isAnchor || pathNumber !== activePath) {
            ctx.fillRect(n.x, n.y, 1, 1);
            return;
        }
        
        let radius = 1;

        if (pathNumber === activePath) {
            radius = 4;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        if (maxNodeIndex === i) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius + 2, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "rgb(" + bgValue + ", " + bgValue + ", " + bgValue + ")";
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "rgb(" + nodeColor + ", " + nodeColor + ", " + nodeColor + ")";
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius - 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawPathBalls(path) {
    let maxNodeIndex = path.nodes.length - 1;

    if (maxNodeIndex === -1) {
        return;
    }

    path.balls.forEach(b => {
        let newIndex = b.pathNodeIndex >= maxNodeIndex ? 0 : b.pathNodeIndex + 1;
        b.pathNodeIndex = newIndex;
        let node = path.nodes[newIndex];

        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(" + b.rgbaArray[0] + ", " + b.rgbaArray[1] + ", " + b.rgbaArray[2] + ", " + b.rgbaArray[3] + ")";
        ctx.fill();
    });
}
