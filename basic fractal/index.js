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
    isDragging=false;
}
function handleMouseMove(e) {
    if (isDragging) {
        moveX += (canMouseX - parseInt(e.clientX - offsetX)) / Math.pow(zoom, 4) * 100.;
        moveY += (canMouseY - parseInt(e.clientY - offsetY)) / Math.pow(zoom, 4) * 100.;
    }
    canMouseX = parseInt(e.clientX - offsetX);
    canMouseY = parseInt(e.clientY - offsetY);
}
function handleMouseWheel(e) {
    zoom += e.deltaY / 530;
}

var gl;
var canvas;
var t, screen_loc, move_loc, zoom_loc, screenQuadVBO;
var mandelBrotShader;
function setupWebGL(evt) {
    window.removeEventListener(evt.type, setupWebGL, false);
    if (!(gl = getRenderingContext()))
        return;

    mandelBrotShader = new Shader("shaders/2d.vert", "shaders/mandelbrot.frag", gl);
    initializeAttributes();
    t = gl.getUniformLocation(mandelBrotShader.program, "time");
    screen_loc = gl.getUniformLocation(mandelBrotShader.program, "screen");
    move_loc = gl.getUniformLocation(mandelBrotShader.program, "move");
    zoom_loc = gl.getUniformLocation(mandelBrotShader.program, "zoom");
    gl.useProgram(mandelBrotShader.program);
    gl.drawArrays(gl.POINTS, 0, 1);
    window.requestAnimationFrame(render);
    //cleanup();
}

function renderQuad() {
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
    mandelBrotShader.use();
    renderQuad();
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
    if (mandelBrotShader.program)
        gl.deleteProgram(mandelBrotShader.program);
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
    canvas.width = canvas.clientWidth * 4;
    canvas.height = canvas.clientHeight * 4;
    var gl = canvas.getContext("webgl")
        || canvas.getContext("experimental-webgl");
    if (!gl) {
        var paragraph = document.querySelector("p");
        paragraph.innerHTML = "Failed to get WebGL context."
            + "Your browser or device may not support WebGL.";
        return null;
    }
    gl.viewport(0, 0,
        gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}
