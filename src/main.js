import * as d3 from "d3"
import {initGl} from "./webGlUtils"

const PI = Math.PI
const canvas = document.getElementById("webgl-canvas")
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let draggedIndex;

const cursorColors = [
  "#ff0000",
  "#00f000",
  "#0000ff",
  "#ff00ff",
  "#ffff00",
  "#ffa000"
];

const cursorColorsRgb = cursorColors.map(hexToRgb);

function hexToRgb(hex){
    return [
        parseInt(hex.substring(1,3), 16)/255,
        parseInt(hex.substring(3,5), 16)/255,
        parseInt(hex.substring(5,7), 16)/255
    ]
}

function clamp(value, min, max){return Math.max(min, Math.min(max, value))}

function complexToCanvas(z, zoomCenter=uniforms.u_zoomCenter.value, zoomSize=uniforms.u_zoomSize.value){
    const x = ((z[0]-zoomCenter[0])/zoomSize+0.5)*minDimension+(canvas.width-minDimension)/2;
    const y = (0.5-(z[1]-zoomCenter[1])/zoomSize)*minDimension+(canvas.height-minDimension)/2;
    return [x, y]
}

function canvasToComplex(pos, zoomCenter=uniforms.u_zoomCenter.value, zoomSize=uniforms.u_zoomSize.value){
    let x = (pos[0]-(canvas.width-minDimension)/2)/minDimension;
    let y = (pos[1]-(canvas.height-minDimension)/2)/minDimension;
    const re = zoomCenter[0] + (x-0.5)*zoomSize;
    const im = zoomCenter[1] + (0.5-y)*zoomSize;
    return [re,im]
}

let zoomCenter = [0, 0];
let zoomSize = 4;
let numRoots = 4;
let minDimension = Math.min(canvas.width, canvas.height);
let roots = Array.from({length:numRoots}, (_, i)=>[Math.cos(2*PI*i/numRoots), Math.sin(2*PI*i/numRoots)])

function uniformDict(type, value){
    return {
        type:type,
        value:value
    }
}

const uniforms = {
    u_resolution:uniformDict("2f", [canvas.width, canvas.height]),
    u_zoomCenter:uniformDict("2f", zoomCenter),
    u_zoomSize:uniformDict("1f", zoomSize),
    u_iterations:uniformDict("1i", 50),
    u_minDimension:uniformDict("1f", minDimension),
    u_roots:uniformDict("2fv",roots),
    u_numRoots:uniformDict("1i",numRoots),
    u_colors:uniformDict("3fv",cursorColorsRgb)
}

const svg = d3.select("#cursor-svg");
function formatLabel(d){
    return d!==0&&(Math.abs(d)<1e-2||Math.abs(d)>=1e4)?
        d3.format(".4~e")(d).replace("e-", "×10⁻").replace("e+", "×10").replace(/(\d)$/, m => m.replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]))
        :d3.format(".4~f")(d)
}

svg.append("rect")
    .attr("width", canvas.width)
    .attr("height",canvas.height)
    .attr("fill", "transparent")
const gridGroup = svg.append("g").attr("class", "grid-layer")
const cursorGroup = svg.append("g").attr("class", "cursor-layer")

function renderGrid(){
    if (!drawGrid){
        gridGroup.selectAll("*").remove();
        return;
    }
    const [left, bot] = canvasToComplex([0, canvas.height]); 
    const [right, top] = canvasToComplex([canvas.width, 0]);
    let xTicks, yTicks;
    if (canvas.width===minDimension){
        const yScale = d3.scaleLinear().domain([bot, top])
        yTicks = yScale.ticks(8)
        const tickSize = yTicks[1]-yTicks[0]
        xTicks = d3.range(
            Math.ceil(left/tickSize)*tickSize, right, tickSize
        )
    } else{
        const xScale = d3.scaleLinear().domain([left,right])
        xTicks = xScale.ticks(8)
        const tickSize = xTicks[1]-xTicks[0]
        yTicks = d3.range(
            Math.ceil(bot/tickSize)*tickSize, top, tickSize
        )
    }
    gridGroup.selectAll(".grid-line").remove();
    gridGroup.selectAll(".grid-label").remove();
    gridGroup.selectAll(".grid-label")
        .data(xTicks.filter(d=>!(d===0&&!yTicks.includes(0))))
        .enter()
        .append("text")
        .attr("class", "grid-label")
        .attr("x", d => clamp(complexToCanvas([d, 0])[0]-5, 30, canvas.width-30))
        .attr("y", clamp(complexToCanvas([0, 0])[1]+5, 5, canvas.height-30))
        .text(d=>formatLabel(d))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging")
        .lower();
    gridGroup.selectAll(".grid-label.y")
        .data(yTicks.filter(d=>d!==0))
        .enter()
        .append("text")
        .attr("class", "grid-label y")
        .attr("x", clamp(complexToCanvas([0, 0])[0]-5, 30, canvas.width-5))
        .attr("y", d=>clamp(complexToCanvas([0, d])[1]+5, 30, canvas.height-30))
        .text(d=>formatLabel(d)+"i")
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging")
        .lower();
    gridGroup.selectAll(".grid-line.x")
        .data(xTicks)
        .enter()
        .append("line")
        .attr("class", "grid-line x")
        .attr("x1", d => complexToCanvas([d, 0])[0])
        .attr("x2", d => complexToCanvas([d, 0])[0])
        .attr("y1", 0)
        .attr("y2", canvas.height)
        .lower();
    gridGroup.selectAll(".grid-line.y")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("class", "grid-line y")
        .attr("y1", d => complexToCanvas([0, d])[1])
        .attr("y2", d => complexToCanvas([0, d])[1])
        .attr("x1", 0)
        .attr("x2", canvas.width)
        .lower();
}

function renderCursors(){
    if (!drawCursor){
        cursorGroup.selectAll("*").remove();
        return;
    }
    const cursors = cursorGroup.selectAll("circle")
        .data(uniforms.u_roots.value, (_, i)=>i)
        .join("circle")
        .attr("cx", (d)=>complexToCanvas(d)[0])
        .attr("cy", (d)=>complexToCanvas(d)[1])
        .attr("fill", (_, i)=>cursorColors[i])
        .call(cursorDragBehavior)
    cursors.filter((_, i)=>i===draggedIndex).raise();
}

const renderScene = initGl(canvas, uniforms);
let drawGrid = true;
let drawCursor = true
function render(){
    renderGrid();
    renderCursors();
    renderScene();
}

const cursorDragBehavior = d3.drag().on("drag", function(e, d){
    [d[0], d[1]] = canvasToComplex([e.x, e.y]);
    d3.select(this)
        .attr("cx", e.x)
        .attr("cy", e.y)
        .raise();
    renderScene();
}).on("start", function(){
    d3.select(this).raise();
})

const backgroundBehaviour = d3.zoom()
    .interpolate(d3.interpolate)
    .scaleExtent([0.000001, 20000])
    .on("zoom", (e)=>{
        const x = (canvas.width/2-e.transform.x)/minDimension;
        const y = (e.transform.y-canvas.height/2)/minDimension;
        uniforms.u_zoomSize.value=zoomSize/e.transform.k;
        uniforms.u_zoomCenter.value[0] = x * uniforms.u_zoomSize.value;
        uniforms.u_zoomCenter.value[1] = y * uniforms.u_zoomSize.value;

        renderGrid();
        svg.selectAll("circle")    
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
        renderScene();
    })
    
svg.call(backgroundBehaviour)
    .call(backgroundBehaviour.transform, d3.zoomIdentity.translate(canvas.width / 2, canvas.height / 2))
    .on("dblclick.zoom", null);
render();

const sliderContent = document.getElementById("slider-content")
function createSlider(sliderDeets){
    const sliderValue = uniforms[sliderDeets.key].value;
    const labelText = document.createElement("label");
    labelText.innerText = sliderDeets.name + ":";
    labelText.className = "slider-text";

    const input = document.createElement("input");
    input.className = "slider-input"
    input.type = "text";
    input.value = sliderValue;
    input.id = sliderDeets.key;

    const slider = document.createElement("input");
    slider.id = "slider"
    slider.type = "range";
    slider.min=String(sliderDeets.min);
    slider.max=String(sliderDeets.max);
    slider.value=String(sliderValue);
    slider.step = "1"

    const labelRow = document.createElement("div");
    labelRow.className = "slider-label"
    labelRow.appendChild(labelText);
    labelRow.appendChild(input);
    
    const label = document.createElement("label");
    label.className="slider-group"
    label.appendChild(labelRow);
    label.appendChild(slider);
    sliderContent.appendChild(label);

    function changeValues(value){
        input.value = value;
        if (sliderDeets.key==="u_numRoots"){
            const numRoots = value;
            const oldRoots = uniforms.u_roots.value.slice();
            const newRoots = Array.from({length:numRoots}, (_, i)=>[Math.cos(2*PI*i/numRoots), Math.sin(2*PI*i/numRoots)]);
            uniforms.u_numRoots.value = Math.max(uniforms.u_numRoots.value, value)
            const farDistance = 5e2*Math.max(...canvasToComplex([canvas.width, canvas.height]).map(x=>Math.abs(x)), ...canvasToComplex([0, 0]).map(x=>Math.abs(x)))
            const extendedOldRoots = Array.from({length:uniforms.u_numRoots.value}, (_, i)=>{
                if (oldRoots[i]) return oldRoots[i];
                return [...newRoots[i].map(x=>x*farDistance)]
            })
            const extendedNewRoots = Array.from({length:uniforms.u_numRoots.value}, (_, i)=>{
                if (newRoots[i]) return newRoots[i];
                return [...oldRoots[i].map(x=>x*farDistance)]
            })
            const interpolators = extendedNewRoots.map((end,i)=>d3.interpolateArray(extendedOldRoots[i],end))
            cursorGroup.selectAll("circle")
                .interrupt()
                .data(extendedNewRoots, (_,i)=>i)
                .transition().duration(800)
                .tween("roots", ()=>{
                    return t=>{
                        uniforms.u_roots.value = interpolators.map(f=>f(t));
                        cursorGroup.selectAll("circle")
                            .attr("cx", d=>complexToCanvas(d)[0])
                            .attr("cy", d=>complexToCanvas(d)[1])
                        render();
                    }
                }).on("end", ()=>{
                    uniforms.u_numRoots.value = value;
                    uniforms.u_roots.value = newRoots;
                    renderCursors();
                    render();
                });
            
        } else {
            uniforms[sliderDeets.key].value = value;
            render();
        }
    }

    slider.addEventListener("input", (e)=>{
        changeValues(e.target.valueAsNumber);
    });
    input.addEventListener("input", (e)=>{
        e.target.value = e.target.value.replace(/[^0-9.]/g,"");
    })
    input.addEventListener("keydown", (e)=>{if (e.key==="Enter") input.blur();
    })
    input.addEventListener("blur", (e)=>{
        const value = clamp(Number(e.target.value), sliderDeets.min, sliderDeets.max)
        changeValues(value);
        slider.value = value;
        render();
    })
}

function createButton(text, eventListener){
    const btn = document.createElement("button")
    btn.innerText = text
    btn.addEventListener("click",eventListener)
    sliderContent.appendChild(btn)
}
createSlider({
    name:"Roots", min:2, max:6, key:"u_numRoots"
})
createSlider({
    name:"Iterations", min:0, max:300, key:"u_iterations"
})
createButton("Hide Grid",function(){
    drawGrid = !drawGrid;
    this.innerText = drawGrid? "Hide Grid":"Show Grid";
    render();
})
createButton("Hide Roots",function(){
    drawCursor = !drawCursor;
    this.innerText = drawCursor? "Hide Roots":"Show Roots";
    render();
})
createButton("Go to Origin",()=>{
  svg.transition().duration(600).ease(d3.easeExpOut).call(backgroundBehaviour.transform, d3.zoomIdentity.translate(canvas.width/2, canvas.height/2));
})
createButton("Reset Roots",()=>{
    const numRoots = uniforms.u_numRoots.value;
    svg.transition()
        .ease(d3.easeExpOut)
        .duration(1000)
        .tween("roots", ()=>{
            const interpolators = uniforms.u_roots.value.map((start, i)=>d3.interpolateArray(start, [Math.cos(2*PI*i/numRoots), Math.sin(2*PI*i/numRoots)]));
            return t=>{
                uniforms.u_roots.value = interpolators.map(f=>f(t));
                cursorGroup.selectAll("circle")
                    .data(uniforms.u_roots.value, (_, i)=>i)
                    .attr("fill", (_, i)=>cursorColors[i])
                    .attr("cx", d=>complexToCanvas(d)[0])
                    .attr("cy", d=>complexToCanvas(d)[1])
                renderScene();
            }
        })
    renderScene();
})

window.addEventListener("resize", () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  uniforms.u_resolution.value = [canvas.width, canvas.height];
  minDimension = Math.min(canvas.width, canvas.height);
  const k = zoomSize/uniforms.u_zoomSize.value
  const tx = canvas.width/2-(uniforms.u_zoomCenter.value[0]/zoomSize)*minDimension*k
  const ty = canvas.height/2+(uniforms.u_zoomCenter.value[1]/zoomSize)*minDimension*k
  svg.call(backgroundBehaviour.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
});

const sliderContainer = document.getElementById("slider-container")
const minBtn = document.getElementById("min-btn")
sliderContainer.prepend(minBtn);
minBtn.addEventListener("click",()=>{
    sliderContainer.classList.toggle("minimized")
    sliderContent.classList.toggle("minimized")
    minBtn.classList.toggle("minimized")
})