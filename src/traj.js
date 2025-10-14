import { uniforms, complexToCanvas, canvasToComplex } from "./state";
import { drag, select, line } from "d3";

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
function complexReciprocal(z2){
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

function getIterations(z, iterations){
    let points = [z];
    for (let i=0;i<iterations;i++){
        z = complexSubtract(z, fOverFPrime(z));
        points.push(z)
    }
    return points;
}

export default function initTraj(svg, drawState){
    const trajGroup = svg.append("g").attr("class", "traj-layer");
    const initialPosition = [0.2, 0.3]
    function renderTraj(){
        const canvasPoints = getIterations(initialPosition, uniforms.u_iterations.value);
        const cursorDragBehavior = drag().on("drag", function(e, d){
                [d[0], d[1]] = canvasToComplex([e.x, e.y]);
                select(this)
                    .attr("cx", e.x)
                    .attr("cy", e.y)
                    .raise();
                const canvasPoints = getIterations(initialPosition, uniforms.u_iterations.value)
                trajGroup.selectAll(".traj-line")
                    .data([canvasPoints])
                    .attr("d", line().x(p=>complexToCanvas(p)[0]).y(p=>complexToCanvas(p)[1]))
                
                trajGroup.selectAll(".traj-point")
                    .data(canvasPoints.slice(1))
                    .attr("cx", (d)=>complexToCanvas(d)[0])
                    .attr("cy", (d)=>complexToCanvas(d)[1])
                
            })
        if (!drawState.drawTraj){
            trajGroup.selectAll("*").remove();
            return;
        }
        
        trajGroup.selectAll(".traj-line")
            .data([canvasPoints])
            .join("path")
            .attr("class", "traj-line")
            .attr("d", line().x(p=>complexToCanvas(p)[0]).y(p=>complexToCanvas(p)[1]))

        trajGroup.selectAll(".traj-point")
            .data(canvasPoints.slice(1))
            .join("circle")
            .attr("class", "traj-point")
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
            .attr("fill", "black")
            
        trajGroup.selectAll(".init-point")
            .data([initialPosition])
            .join("circle")
            .attr("class", "init-point")
            .attr("cx", (d)=>complexToCanvas(d)[0])
            .attr("cy", (d)=>complexToCanvas(d)[1])
            .attr("fill", "black")
            .call(cursorDragBehavior)
    }
    return renderTraj
}