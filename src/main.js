import * as d3 from "d3"
import { initGl } from "./webgl/webGlUtils"
import {uniforms} from "./components/state"
import initGrid from "./components/grid"
import initCursors from "./components/cursors"
import initZoom from "./components/zoom"
import initSliders from "./components/sliders"
import initButtons from "./components/buttons"
import initMinimize from "./components/minimize"
import initTraj from "./components/traj"

const canvas = document.getElementById("webgl-canvas")
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const zoomSize = uniforms.u_zoomSize.value

const svg = d3.select("#cursor-svg");

let drawState = {
    drawGrid:true,
    drawCursor:true,
    drawTraj:false
}

const renderGl = initGl(canvas, uniforms);
const renderGrid = initGrid(canvas,svg, drawState);

const renderTraj = initTraj(svg, drawState)
const [renderCursors, cursorGroup] = initCursors(svg, renderGl, renderTraj, drawState);

const backgroundBehaviour = initZoom(canvas, svg, uniforms, zoomSize, renderGrid, renderGl, renderTraj);

function render(){
    renderGl();
    renderTraj();
    renderGrid();
    renderCursors();
}
render();

const sliderContent = document.getElementById("slider-content")
initSliders(canvas, uniforms, sliderContent, render, renderCursors, cursorGroup);
initButtons(canvas, svg, uniforms, sliderContent, render, renderGl, renderTraj, backgroundBehaviour, cursorGroup, drawState);
initMinimize(sliderContent);