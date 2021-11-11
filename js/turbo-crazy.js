import { Ball } from './ball.js?v=1.3';
import { Path } from './path.js?v=1.2';
import { PathNode } from './path-node.js?v=1.1';
import { Vector } from './vector.js?v=1.1';

let c;
let ctx;
let cRect;
let bgSlider;

let secondsPassed;
let oldTimestamp;
let fps;

let bgValue;

let paths = new Map();

let ballColor = '#000000';
let showPath = true;

let activePalette = -1;
let activePath = -1;

document.addEventListener('DOMContentLoaded', (event) => {

    window.scrollTo(0, 0);

    let clientWidth = document.body.clientWidth;

    if (clientWidth < 700) {
        alert('Please make your browser window wider and reload the page.');
        return;
    }

    c = document.getElementById('canvas');
    ctx = c.getContext('2d');

    ctx.canvas.width = clientWidth - 100;

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

    document.getElementById('undo').addEventListener('click', removeNode);

    document.getElementById('redo').addEventListener('click', undoRemoveNode);

    let palettes = document.getElementsByClassName('palette');

    for (let palette of palettes) {
        palette.addEventListener('click', switchPalette);
    }

    let swatches = document.getElementsByClassName('swatch');

    for (let swatch of swatches) {
        swatch.addEventListener('click', switchColor);
    }

    // initialize the paths map with 10 paths
    for (let pathNumber = 1; pathNumber <= 10; pathNumber++) {
        paths.set(pathNumber, new Path())
    }

    let pathEditor = document.getElementById('path-editor');
    let pathToggles = document.getElementsByClassName('path-toggle');
    
    for (let pathToggle of pathToggles) {
        pathToggle.addEventListener('click', function() {
            if (pathEditor.style.display === 'none') {
                pathEditor.style.display = 'block';
                pathToggle.innerHTML = '<';
            } else {
                pathEditor.style.display = 'none';
                pathToggle.innerHTML = '>';
            }
        });
    }

    // make pallete-1 the active palette
    document.getElementById('palette-7').click();

    // make path-1 the active path
    document.getElementById('path-1').click();

    window.requestAnimationFrame(gameLoop);
});

function checkKey(e) {
    e.preventDefault();
    
    switch (e.code) {
        case 'Space':
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

        case 'KeyH':
            showPath = !showPath;
            break;

        case 'Digit0':
        case 'Numpad0':
            document.getElementById('path-10').click();
            break;

        case 'Digit1':
        case 'Numpad1':
            document.getElementById('path-1').click();
            break;

        case 'Digit2':
        case 'Numpad2':
            document.getElementById('path-2').click();
            break;

        case 'Digit3':
        case 'Numpad3':
            document.getElementById('path-3').click();
            break;

        case 'Digit4':
        case 'Numpad4':
            document.getElementById('path-4').click();
            break;

        case 'Digit5':
        case 'Numpad5':
            document.getElementById('path-5').click();
            break;

        case 'Digit6':
        case 'Numpad6':
            document.getElementById('path-6').click();
            break;

        case 'Digit7':
        case 'Numpad7':
            document.getElementById('path-7').click();
            break;

        case 'Digit8':
        case 'Numpad8':
            document.getElementById('path-8').click();
            break;

        case 'Digit9':
        case 'Numpad9':
            document.getElementById('path-9').click();
            break;

        case 'Minus':
        case 'NumpadSubtract':
            adjustSpeed(-1);
            break;

        case 'Equal':
        case 'NumpadAdd':
            adjustSpeed(1);
            break;
        
        default:
            break;
    }

    return false;
}

function adjustSpeed(adjustment) {
    let path = paths.get(activePath);
    path.adjustSpeed(adjustment);
}

function switchPalette(e) {
    window.getSelection().removeAllRanges();

    let paletteNumber = parseInt(e.currentTarget.id.split('-')[1]);
    
    if (paletteNumber === activePalette) {
        return;
    }

    switch (paletteNumber) {
        case 1:
            buildSwatches(['#FFF0F3','#FFCCD5','#FFB3C1','#FF8FA3','#FF758F','#FF4D6D','#C9184A','#A4133C','#800F2F','#590D22']);
            break;

        case 2:
            buildSwatches(['#F8F9FA','#E9ECEF','#DEE2E6','#CED4DA','#ADB5BD','#6C757D','#495057','#343A40','#212529']);
            break;

        case 3:
            buildSwatches(['#80FFDB','#72EFDD','#64DFDF','#56CFE1','#48BFE3','#4EA8DE','#5390D9','#5E60CE','#6930C3','#7400B8']);
            break;

        case 4:
            buildSwatches(['#FFFFFC','#FFC6FF','#BDB2FF','#A0C4FF','#9BF6FF','#CAFFBF','#FDFFB6','#FFD6A5','#FFADAD']);
            break;

        case 5:
            buildSwatches(['#FFBA08','#FAA307','#F48C06','#E85D04','#DC2F02','#D00000','#9D0208','#6A040F','#370617','#03071E']);
            break;

        case 6:
            buildSwatches(['#E63946','#F1FAEE','#A8DADC','#457B9D','#1D3557']);
            break;

        case 7:
            buildSwatches(['#FF0000','#FF8700','#FFD300','#DEFF0A','#A1FF0A','#0AFF99', '#0AEFFF','#147DF5','#580AFF','#BE0AFF']);
            break;

        case 8:
            buildSwatches(['#CCFF33','#9EF01A','#70E000','#38B000','#008000','#007200','#006400','#004B23']);
            break;

        case 9:
            buildSwatches(['#E0AAFF','#C77DFF','#9D4EDD','#7B2CBF','#5A189A','#3C096C','#240046','#10002B']);
            break;

        case 10:
            buildSwatches(['#FF595E','#FFCA3A','#8AC926','#1982C4','#6A4C93']);
            break;

        case 11:
            buildSwatches(['#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1']);
            break;

        case 12:
            buildSwatches(['#FFEA00','#FFDD00','#FFD000','#FFC300','#FFB700','#FFAA00','#FFA200','#FF9500','#FF8800','#FF7B00']);
            break;

        case 13:
            buildSwatches(['#EDC4B3','#E6B8A2','#DEAB90','#D69F7E','#CD9777','#C38E70','#B07D62','#9D6B53','#8A5A44','#774936']);
            break;

        case 14:
            buildSwatches(['#000000']);
            break;

        default:
            break;
    }

    document.getElementById('swatch-1').click();
}

function buildSwatches(colors) {
    let maxIndex = colors.length;

    for (let i = 1; i <= 12; i++) {
        let swatch = document.getElementById('swatch-' + i);

        swatch.style.borderColor = 'transparent';
        swatch.style.backgroundColor = 'transparent';

        if (i - 1 < maxIndex) {
            swatch.style.backgroundColor = colors[i - 1];
        }
    }
}

function switchColor(e) {    
    let swatchNumber = parseInt(e.currentTarget.id.split('-')[1]);
    let clickedSwatch = document.getElementById('swatch-' + swatchNumber);
    
    if (clickedSwatch.style.backgroundColor === 'transparent') {
        return;
    }

    let swatches = document.getElementsByClassName('swatch');

    for (let swatch of swatches) {
        swatch.style.borderColor = 'transparent';
    }

    ballColor = clickedSwatch.style.backgroundColor;
    clickedSwatch.style.borderColor = 'red';
}

function switchActivePath(e) {
    window.getSelection().removeAllRanges();

    let pathNumber = parseInt(e.currentTarget.id.split('-')[1]);
    let clickedElement = e.target;

    if (activePath === pathNumber) {
        return;
    }
    
    activePath = pathNumber;

    let pathDivs = document.getElementsByClassName('path');

    for (let div of pathDivs) {
        div.classList.remove('selected-path');
    }

    let pathToggleSpans = document.getElementsByClassName('path-toggle');

    for (let span of pathToggleSpans) {
        span.style.display = 'none';
    }

    let parentPathDiv = document.getElementById('path-' + activePath);
    parentPathDiv.classList.add('selected-path');

    let pathEditor = document.getElementById('path-editor');
    let toggleSpan = parentPathDiv.querySelector('.path-toggle');
    toggleSpan.style.display = 'inline-block';

    if (pathEditor.style.display === 'none') {
        toggleSpan.innerHTML = '>';
    } else {
        toggleSpan.innerHTML = '<';
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
        let newIndex = (b.pathNodeIndex + path.speed) % path.nodes.length;
        
        if (newIndex < 0) {
            newIndex = path.nodes.length + newIndex;
        }

        b.pathNodeIndex = newIndex;
        let node = path.nodes[newIndex];

        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = b.rgbColor;
        ctx.fill();
    });
}
