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