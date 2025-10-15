import { uniforms } from "./state";
import { drag, select, line } from "d3";
import { cursorColors, getIterations, complexToCanvas, canvasToComplex, complexDistance } from "./funcUtils";

function getNearestColor(z, roots = uniforms.u_roots.value){
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    for (let i = 0; i<roots.length;i++){
        const currentDistance = complexDistance(z, roots[i])
        if (nearestDistance>currentDistance&&currentDistance<5){
            nearestDistance = currentDistance;
            nearestIndex = i;
        }
    }
    return nearestIndex!==-1?cursorColors[nearestIndex]:"black"
}

export default function initTraj(svg, drawState){
    const trajGroup = svg.append("g").attr("class", "traj-layer");
    const initialPosition = [0.2, 0.3]
    function renderTraj(){
        let complexPoints = getIterations(initialPosition, uniforms.u_iterations.value);
        let nearestColor = getNearestColor(complexPoints.at(-1));
        const cursorDragBehavior = drag().on("drag", function(e, d){
                [d[0], d[1]] = canvasToComplex([e.x, e.y]);
                complexPoints = getIterations(initialPosition, uniforms.u_iterations.value)
                nearestColor = getNearestColor(complexPoints.at(-1));
                select(this)
                    .attr("cx", e.x)
                    .attr("cy", e.y)
                    .raise()
                    .attr("fill", nearestColor)
                trajGroup.selectAll(".traj-line")
                    .data([complexPoints])
                    .attr("d", line().x(p=>complexToCanvas(p)[0]).y(p=>complexToCanvas(p)[1]))
                    .attr("stroke", nearestColor)
                
                trajGroup.selectAll(".traj-point")
                    .data(complexPoints.slice(1))
                    .attr("cx", (d)=>complexToCanvas(d)[0])
                    .attr("cy", (d)=>complexToCanvas(d)[1])
                    .attr("fill", nearestColor)
                
            })
        if (!drawState.drawTraj){
            trajGroup.selectAll("*").remove();
            return;
        }
        
        trajGroup.selectAll(".traj-line")
            .data([complexPoints])
            .join("path")
            .attr("class", "traj-line")
            .attr("d", line().x(p=>complexToCanvas(p)[0]).y(p=>complexToCanvas(p)[1]))
            .attr("stroke", nearestColor)
        
        trajGroup.selectAll(".traj-point")
            .data(complexPoints.slice(1))
            .join("circle")
            .attr("class", "traj-point")
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
            .attr("fill", nearestColor)
            
        trajGroup.selectAll(".init-point")
            .data([initialPosition])
            .join("circle")
            .attr("class", "init-point")
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
            .attr("fill", nearestColor)
            .call(cursorDragBehavior)
    }
    return renderTraj
}