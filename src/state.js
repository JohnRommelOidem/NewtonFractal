import { hexToRgb, minDimension, circleComplex, uniformDict, cursorColors } from "./funcUtils";

const canvas = document.getElementById("webgl-canvas")
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const cursorColorsRgb = cursorColors.map(hexToRgb);

let zoomCenter = [0, 0];
let zoomSize = 4;
let numRoots = 4;
let roots = Array.from({length:numRoots}, (_, i)=>circleComplex(numRoots, i))

export const uniforms = {
    u_resolution:uniformDict("2f", [canvas.width, canvas.height]),
    u_zoomCenter:uniformDict("2f", zoomCenter),
    u_zoomSize:uniformDict("1f", zoomSize),
    u_iterations:uniformDict("1i", 50),
    u_minDimension:uniformDict("1f", minDimension(canvas)),
    u_roots:uniformDict("2fv",roots),
    u_numRoots:uniformDict("1i",numRoots),
    u_colors:uniformDict("3fv",cursorColorsRgb)
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