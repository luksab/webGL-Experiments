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
    return 0.;
}

void main() {
    vec2 xy = vPos*screen/length(screen);
    xy /= zoom*zoom;
    xy += move;
    float f = fractal(xy);
  gl_FragColor = vec4(
    f,
    f,
    f, 1.0 );
}