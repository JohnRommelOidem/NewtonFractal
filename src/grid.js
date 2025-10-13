import {scaleLinear, range} from "d3"
import { complexToCanvas, canvasToComplex } from "./state";
import { clamp, minDimension, formatLabel } from "./funcUtils";

export default function initGrid(canvas, svg, drawState){
    
    const gridGroup = svg.append("g").attr("class", "grid-layer")
    
    function renderGrid(){
        if (!drawState.drawGrid){
            gridGroup.selectAll("*").remove();
            return;
        }
        const [left, bot] = canvasToComplex([0, canvas.height]); 
        const [right, top] = canvasToComplex([canvas.width, 0]);
        let xTicks, yTicks;
        if (canvas.width===minDimension(canvas)){
            const yScale = scaleLinear().domain([bot, top])
            yTicks = yScale.ticks(8)
            const tickSize = yTicks[1]-yTicks[0]
            xTicks = range(
                Math.ceil(left/tickSize)*tickSize, right, tickSize
            )
        } else{
            const xScale = scaleLinear().domain([left,right])
            xTicks = xScale.ticks(8)
            const tickSize = xTicks[1]-xTicks[0]
            yTicks = range(
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
    return renderGrid;
}