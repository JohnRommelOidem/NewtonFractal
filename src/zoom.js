import {zoom, interpolate, zoomIdentity} from "d3"
import { minDimension } from "./funcUtils";
import { complexToCanvas } from "./state";

export default function initZoom(canvas, svg, uniforms, zoomSize, renderGrid, renderGl, renderTraj){
    const backgroundBehaviour = zoom()
        .interpolate(interpolate)
        .on("zoom", (e)=>{
            const x = (canvas.width/2-e.transform.x)/minDimension(canvas);
            const y = (e.transform.y-canvas.height/2)/minDimension(canvas);
            uniforms.u_zoomSize.value=zoomSize/e.transform.k;
            uniforms.u_zoomCenter.value[0] = x * uniforms.u_zoomSize.value;
            uniforms.u_zoomCenter.value[1] = y * uniforms.u_zoomSize.value;

            renderGrid();
            renderTraj();
            svg.selectAll("circle")
                .attr("cx", (d)=>complexToCanvas(d)[0])
                .attr("cy", (d)=>complexToCanvas(d)[1])
            renderGl();
        })
        
    svg.call(backgroundBehaviour)
        .call(backgroundBehaviour.transform, zoomIdentity.translate(canvas.width / 2, canvas.height / 2))
        .on("dblclick.zoom", null);
    return backgroundBehaviour;
}