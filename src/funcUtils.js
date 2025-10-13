import {format} from "d3"
const PI = Math.PI;
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

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const minDimension = (canvas) => Math.min(canvas.width, canvas.height);

export const circleComplex = (numRoots, i) => [Math.cos(2*PI*i/numRoots), Math.sin(2*PI*i/numRoots)];