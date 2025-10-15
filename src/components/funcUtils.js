import {format} from "d3"
import { uniforms } from "./state";
const PI = Math.PI;
const canvas = document.getElementById("webgl-canvas")
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
export const cursorColors = [
  "#ff0000",
  "#00f000",
  "#0000ff",
  "#ff00ff",
  "#ffff00",
  "#ffa000"
];

export function hexToRgb(hex){
    return [
        parseInt(hex.substring(1,3), 16)/255,
        parseInt(hex.substring(3,5), 16)/255,
        parseInt(hex.substring(5,7), 16)/255
    ]
}

export function uniformDict(type, value){
    return {
        type:type,
        value:value
    }
}

export function formatLabel(d){
    return d!==0&&(Math.abs(d)<1e-2||Math.abs(d)>=1e4)?
        format(".4~e")(d).replace("e-", "×10⁻").replace("e+", "×10").replace(/(\d)$/, m => m.replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]))
        :format(".4~f")(d)
}

function complexAdd(z1, z2){
    return [z1[0]+z2[0], z1[1]+z2[1]]
}

function complexSubtract(z1, z2){
    return [z1[0]-z2[0], z1[1]-z2[1]]
}

function complexMult(z1, z2){
    return [
        z1[0]*z2[0]-z1[1]*z2[1], 
        z1[0]*z2[1]+z1[1]*z2[0]
    ]
}


function complexDiv(z1, z2){
    const denominator = z2[0]**2+z2[1]**2;
    return [
        (z1[0]*z2[0]+z1[1]*z2[1])/denominator, 
        (z1[1]*z2[0]-z1[0]*z2[1])/denominator
    ]
}

function fOverFPrime(z, roots = uniforms.u_roots.value){
    let result = [1,0];
    let deriv = [0,0];
    for (let i=0;i<roots.length;i++){
        result = complexMult(result, complexSubtract(z, roots[i]));
        let term = [1,0];
        for (let j=0;j<roots.length;j++){
            if (i!==j){
                term = complexMult(term, complexSubtract(z, roots[j]));
            }
        }
        deriv = complexAdd(deriv, term)
    }
    return complexDiv(result, deriv);
}

export function complexDistance(z1, z2){
    const displacement = complexSubtract(z1, z2);
    return displacement[0]**2+displacement[1]**2
}

/*
function complexReciprocal(z){
    const denominator = z[0]**2+z[1]**2;
    return [
        z[0]/denominator, 
        -z[1]/denominator
    ]
} 

function fOverFPrime(z, roots = uniforms.u_roots.value){
    let denom = [0, 0];
    for (let i=0;i<roots.length;i++){
        denom = complexAdd(denom, complexReciprocal(complexSubtract(z, roots[i])));
    }
    return complexReciprocal(denom);
}*/

export function getIterations(z, iterations){
    let points = [z];
    for (let i=0;i<iterations;i++){
        z = complexSubtract(z, fOverFPrime(z));
        points.push(z)
    }
    return points;
}

export function complexToCanvas(z, zoomCenter=uniforms.u_zoomCenter.value, zoomSize=uniforms.u_zoomSize.value){
    const minDimValue = minDimension(canvas);
    const x = ((z[0]-zoomCenter[0])/zoomSize+0.5)*minDimValue+(canvas.width-minDimValue)/2;
    const y = (0.5-(z[1]-zoomCenter[1])/zoomSize)*minDimValue+(canvas.height-minDimValue)/2;
    return [x, y]
}

export function canvasToComplex(pos, zoomCenter=uniforms.u_zoomCenter.value, zoomSize=uniforms.u_zoomSize.value){
    const minDimValue = minDimension(canvas);
    let x = (pos[0]-(canvas.width-minDimValue)/2)/minDimValue;
    let y = (pos[1]-(canvas.height-minDimValue)/2)/minDimValue;
    const re = zoomCenter[0] + (x-0.5)*zoomSize;
    const im = zoomCenter[1] + (0.5-y)*zoomSize;
    return [re,im]
}

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const minDimension = (canvas) => Math.min(canvas.width, canvas.height);

export const circleComplex = (numRoots, i) => [Math.cos(2*PI*i/numRoots), Math.sin(2*PI*i/numRoots)];