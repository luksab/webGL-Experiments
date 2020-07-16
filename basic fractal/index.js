"use strict"
window.addEventListener("load", setupWebGL, false);

var isDragging = false;
var canMouseX, canMouseY;
var offsetX, offsetY, canvasWidth, canvasHeight;
var startMoveX, startMoveY;
var moveX = 0., moveY = 0.;
var zoom = 2;

function handleMouseDown(e) {
    canMouseX = parseInt(e.clientX - offsetX);
    canMouseY = parseInt(e.clientY - offsetY);
    startMoveX = canMouseX;
    startMoveY = canMouseY;
    // set the drag flag
    isDragging = true;
}
function handleMouseUp(e) {
    canMouseX = parseInt(e.clientX - offsetX);
    canMouseY = parseInt(e.clientY - offsetY);
    // clear the drag flag
    isDragging = false;
}

function handleMouseOut(e) {
    canMouseX = parseInt(e.clientX - offsetX);
    canMouseY = parseInt(e.clientY - offsetY);
    // user has left the canvas, so clear the drag flag
    //isDragging=false;
}
function handleMouseMove(e) {
    if (isDragging) {
        moveX += (canMouseX - parseInt(e.clientX - offsetX)) / Math.pow(zoom, 4)*100.;
        moveY += (canMouseY - parseInt(e.clientY - offsetY)) / Math.pow(zoom, 4)*100.;
    }
    canMouseX = parseInt(e.clientX - offsetX);
    canMouseY = parseInt(e.clientY - offsetY);
}
function handleMouseWheel(e) {
    zoom += e.deltaY / 530;
}

var gl,
    program;
var canvas;
var t, screen_loc, move_loc, zoom_loc, screenQuadVBO;
function setupWebGL(evt) {
    window.removeEventListener(evt.type, setupWebGL, false);
    if (!(gl = getRenderingContext()))
        return;

    var source = document.querySelector("#vertex-shader").innerHTML;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, source);
    gl.compileShader(vertexShader);
    source = document.querySelector("#fragment-shader").innerHTML
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, source);
    gl.compileShader(fragmentShader);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader));
    gl.attachShader(program, fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var linkErrLog = gl.getProgramInfoLog(program);
        cleanup();
        document.querySelector("p").innerHTML =
            "Shader program did not link successfully. "
            + "Error log: " + linkErrLog;
        return;
    }
    initializeAttributes();
    gl.useProgram(program);
    t = gl.getUniformLocation(program, "time");
    screen_loc = gl.getUniformLocation(program, "screen");
    move_loc = gl.getUniformLocation(program, "move");
    zoom_loc = gl.getUniformLocation(program, "zoom");
    gl.drawArrays(gl.POINTS, 0, 1);
    window.requestAnimationFrame(render);
    //cleanup();
}

function renderQuad(shaderProgram) {

    if (!shaderProgram) {
        utils.warning("Missing the shader program!");
        return;
    }

    // Only created once
    if (screenQuadVBO == null) {
        var verts = [
            // First triangle:
            1.0, 1.0,
            -1.0, 1.0,
            -1.0, -1.0,
            // Second triangle:
            -1.0, -1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        screenQuadVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    }

    // Bind:
    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVBO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Draw 6 vertexes => 2 triangles:
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Cleanup:
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(t, performance.now() / 1000.);
    gl.uniform2f(screen_loc, canvas.clientWidth, canvas.clientHeight);
    gl.uniform2f(move_loc, moveX / canvasWidth, -moveY / canvasHeight);
    gl.uniform1f(zoom_loc, Math.pow(zoom, 2) / 10.);
    //gl.drawArrays(gl.POINTS, 0, 1);
    renderQuad(program);
    window.requestAnimationFrame(render);
}

var buffer;
function initializeAttributes() {
    gl.enableVertexAttribArray(0);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function cleanup() {
    gl.useProgram(null);
    if (buffer)
        gl.deleteBuffer(buffer);
    if (program)
        gl.deleteProgram(program);
}

function getRenderingContext() {
    canvas = document.querySelector("canvas");

    offsetX = canvas.offsetLeft;
    offsetY = canvas.offsetTop;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);
    canvas.addEventListener("wheel", handleMouseWheel);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    var gl = canvas.getContext("webgl")
        || canvas.getContext("experimental-webgl");
    if (!gl) {
        var paragraph = document.querySelector("p");
        paragraph.innerHTML = "Failed to get WebGL context."
            + "Your browser or device does not support WebGL.";
        return null;
    }
    gl.viewport(0, 0,
        gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}