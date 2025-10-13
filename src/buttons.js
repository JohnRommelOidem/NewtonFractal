import { easeExpOut, zoomIdentity, interpolateArray } from "d3"
import { circleComplex, cursorColors} from "./funcUtils"
import { complexToCanvas } from "./state"
export default function initButtons(canvas, svg, uniforms, sliderContent, render, renderGl, backgroundBehaviour, cursorGroup, drawState){
    function createButton(text, eventListener){
        const btn = document.createElement("button")
        btn.innerText = text
        btn.addEventListener("click",eventListener)
        sliderContent.appendChild(btn)
    }
    createButton("Hide Grid",function(){
        drawState.drawGrid = !drawState.drawGrid;
        this.innerText = drawState.drawGrid? "Hide Grid":"Show Grid";
        render();
    })
    createButton("Hide Roots",function(){
        drawState.drawCursor = !drawState.drawCursor;
        this.innerText = drawState.drawCursor? "Hide Roots":"Show Roots";
        render();
    })
    createButton("Go to Origin",()=>{
    svg.transition().duration(600).ease(easeExpOut).call(backgroundBehaviour.transform, zoomIdentity.translate(canvas.width/2, canvas.height/2));
    })
    createButton("Reset Roots",()=>{
        const numRoots = uniforms.u_numRoots.value;
        svg.transition()
            .ease(easeExpOut)
            .duration(1000)
            .tween("roots", ()=>{
                const interpolators = uniforms.u_roots.value.map((start, i)=>interpolateArray(start, circleComplex(numRoots, i)));
                return t=>{
                    uniforms.u_roots.value = interpolators.map(f=>f(t));
                    cursorGroup.selectAll("circle")
                        .data(uniforms.u_roots.value, (_, i)=>i)
                        .attr("fill", (_, i)=>cursorColors[i])
                        .attr("cx", d=>complexToCanvas(d)[0])
                        .attr("cy", d=>complexToCanvas(d)[1])
                    renderGl();
                }
            })
        renderGl();
    })
}