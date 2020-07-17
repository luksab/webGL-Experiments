class Shader {
    constructor(vertex, fragment, gl) {
        this.gl = gl;
        this.loadShaders(vertex, fragment);
    }

    use() {
        this.gl.useProgram(this.shader);
    }

    loadShaders(vertex, fragment){
        this.vertexSource = vertex;
        this.fragmentSource = fragment;

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        this.gl.shaderSource(this.vertexShader, this.getSourceSync(this.vertexSource));
        this.gl.compileShader(this.vertexShader);
        this.gl.shaderSource(this.fragmentShader, this.getSourceSync(this.fragmentSource));
        this.gl.compileShader(this.fragmentShader);

        this.program = this.gl.createProgram();

        this.gl.attachShader(this.program, this.vertexShader);
        var log = this.gl.getShaderInfoLog(this.fragmentShader);
        if (log)
            console.error(log);

        this.gl.attachShader(this.program, this.fragmentShader);
        log = this.gl.getShaderInfoLog(this.fragmentShader);
        if (log)
            console.error(log);
        this.gl.linkProgram(this.program);

        this.gl.detachShader(this.program, this.vertexShader);
        this.gl.detachShader(this.program, this.fragmentShader);
        this.gl.deleteShader(this.vertexShader);
        this.gl.deleteShader(this.fragmentShader);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            var linkErrLog = this.gl.getProgramInfoLog(this.program);
            cleanup();
            console.error(linkErrLog);
            return;
        }
    }

    getSourceSync(url) {
        var req = new XMLHttpRequest();
        req.open("GET", url, false);
        req.send(null);
        return (req.status == 200) ? req.responseText : null;
    };
}