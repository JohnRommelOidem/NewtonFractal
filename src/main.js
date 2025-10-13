import * as d3 from "d3"
import {initGl} from "./webGlUtils"
import {uniforms} from "./state"
import initGrid from "./grid"
import initCursors from "./cursors"
import initZoom from "./zoom"
import initSliders from "./sliders"
import initButtons from "./buttons"
import initMinimize from "./minimize"

const canvas = document.getElementById("webgl-canvas")
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const zoomSize = uniforms.u_zoomSize.value

const svg = d3.select("#cursor-svg");

let drawState = {
    drawGrid:true,
    drawCursor:true
}

const renderGl = initGl(canvas, uniforms);
const renderGrid = initGrid(canvas,svg, drawState);
const [renderCursors, cursorGroup] = initCursors(svg, renderGl, drawState);

function render(){
    renderGrid();
    renderCursors();
    renderGl();
}

const backgroundBehaviour = initZoom(canvas, svg, uniforms, zoomSize, renderGrid, renderGl);

render();

const sliderContent = document.getElementById("slider-content")
initSliders(canvas, uniforms, sliderContent, render, renderCursors, cursorGroup);
initButtons(canvas, svg, uniforms, sliderContent, render, renderGl, backgroundBehaviour, cursorGroup, drawState)
initMinimize(sliderContent)