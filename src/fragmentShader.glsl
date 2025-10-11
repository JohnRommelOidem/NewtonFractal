#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_zoomCenter;
uniform float u_zoomSize;
uniform int u_iterations;
uniform float u_minDimension;
uniform vec2 u_roots[6];
uniform int u_numRoots;
uniform vec3 u_colors[6];
out vec4 outputColor;

vec2 complexMult(vec2 z1, vec2 z2){
    return vec2(z1.x*z2.x-z1.y*z2.y, z1.x*z2.y+z1.y*z2.x);
}

vec2 complexDiv(vec2 z1, vec2 z2){
    return vec2((z1.x*z2.x+z1.y*z2.y)/dot(z2, z2), (-z1.x*z2.y+z1.y*z2.x)/dot(z2, z2));
}

vec2 f(vec2 z){
    vec2 result = vec2(1.0, 0.0);
    for (int i=0;i<u_numRoots;i++){
        result = complexMult(result,z-u_roots[i]);
    }
    return result;
}
vec2 fPrime(vec2 z){
    vec2 result = vec2(0.0);
    for (int i=0;i<u_numRoots;i++){
        vec2 term = vec2(1.0, 0.0);
        for (int j=0;j<u_numRoots;j++){
            if (i!=j){
                term = complexMult(term,z-u_roots[j]);
            }
        }
        result += term;
    }
    return result;
}

void main(){
    vec2 uv = (gl_FragCoord.xy-u_resolution/2.0)/u_minDimension;
    vec2 z = u_zoomCenter+uv*u_zoomSize;
    int iterCount = 0;
    vec2 zNext = vec2(0.0);
    for(int i=0;i<u_iterations;i++){
        zNext = z - complexDiv(f(z),fPrime(z));
        if (length(zNext-z)<1e-6) break;
        z = zNext;
        iterCount = i;
    }
    float minDist = distance(z, u_roots[0]); 
    int closestIndex = 0;
    for (int i=1;i<u_numRoots;i++){
        float dist = distance(z, u_roots[i]);
        if (dist<minDist){
            minDist = dist;
            closestIndex=i;
        }
    }
    if (minDist<5.0){
        float t = mod(float(iterCount)/15.0, 1.0);
        vec3 finalColor = u_colors[closestIndex]*(1.5*(pow(t,2.0)-t)+1.0);
        outputColor = vec4(finalColor, 1.0);
    }
}