#define PI 3.1415926538
precision highp float;
uniform float time;
uniform vec2 screen;
uniform vec2 move;
uniform float zoom;
varying vec2 vPos;


vec2 cmpxcjg(in vec2 c) {
	return vec2(c.x, -c.y);
}

vec2 cmpxmul(in vec2 a, in vec2 b) {
	return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
}

vec2 cmpxpow(in vec2 c, int p) {
	for (int i = 0; i < 100000; ++i) {
        if (i == p) break;
		c = cmpxmul(c, c);
	}
    return c;
}

vec2 cmpxdiv(in vec2 a, in vec2 b) {
    return cmpxmul(a, cmpxcjg(b));
}

float cmpxmag(in vec2 c) {
    return sqrt(c.x * c.x + c.y * c.y);
}

vec2 rek(vec2 z, vec2 c){
    return cmpxmul(z,z)+c;
}

float fractal(vec2 cords){
    vec2 z = rek(vec2(0.,0.), cords);
    for (int i = 0; i<500; i++){
        z = rek(z, cords);
        if(cmpxmag(z) > 5000.){
            return float(i)/100.;
        }
    }
    return length(z);
}

vec4 color(float c){
    return vec4(sin(c*PI), sin(c*PI + 2.*PI/3.), sin(c*PI + 4.*PI/3.), 1.);
}

void fractalDraw(vec2 cords){
    vec2 z = rek(vec2(0.,0.), cords);
    for (int i = 0; i<500; i++){
        z = rek(z, cords);
        if(cmpxmag(z) > 5000.){
            gl_FragColor = color(float(i)/10.);//vec4(float(i)/100., 0.5, 0.5, 1.0);
            return;
        }
    }
    gl_FragColor = vec4(0.,0.,0.,1.);//vec4(0.5, length(z), 0.5, 1.0);
    return;
}

void main() {
    vec2 xy = vPos*screen/length(screen);
    xy /= zoom*zoom;
    xy += move;
    fractalDraw(xy);
}