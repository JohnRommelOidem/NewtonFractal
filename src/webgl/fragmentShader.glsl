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

vec2 complexReciprocal(vec2 z){
    return vec2(z.x,-z.y)/dot(z,z);
}

vec2 fOverFPrime(vec2 z){
    vec2 denominator = vec2(0.0);
    for (int i=0;i<u_numRoots;i++){
        denominator += complexReciprocal(z-u_roots[i]);
    }
    return complexReciprocal(denominator);
}

void main(){
    vec2 uv = (gl_FragCoord.xy-u_resolution/2.0)/u_minDimension;
    vec2 z = u_zoomCenter+uv*u_zoomSize;
    int iterCount = 0;
    int closestIndex = -1;
    for(int i=0;i<u_iterations;i++){
        z = z - fOverFPrime(z);
        for (int j=0;j<u_numRoots;j++){
            if (length(z-u_roots[j])<1e-2){
                iterCount = i;
                i = u_iterations;
                closestIndex = j;
                break;
            };
        }
    }
    float minDist = distance(z, u_roots[closestIndex]); 
    for (int i=0;i<u_numRoots;i++){
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