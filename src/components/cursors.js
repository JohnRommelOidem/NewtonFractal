import { cursorColors, complexToCanvas, canvasToComplex } from "./funcUtils";
import { uniforms } from "./state";
import {drag, select} from "d3";

export default function initCursors(svg, renderGl, renderTraj, drawState){
    const cursorGroup = svg.append("g").attr("class", "cursor-layer");

    const cursorDragBehavior = drag().on("drag", function(e, d){
        [d[0], d[1]] = canvasToComplex([e.x, e.y]);
        select(this)
            .attr("cx", e.x)
            .attr("cy", e.y)
            .raise();
        renderTraj();
        renderGl();
    }).on("start", function(){
        select(this).raise();
    })

    function renderCursors(){
        if (!drawState.drawCursor){
            cursorGroup.selectAll("*").remove();
            return;
        }
        cursorGroup.selectAll("circle")
            .data(uniforms.u_roots.value, (_, i)=>i)
            .join("circle")
            .attr("class", "cursor")
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
            .attr("fill", (_, i)=>cursorColors[i])
            .call(cursorDragBehavior)
    }
    return [renderCursors, cursorGroup];
}