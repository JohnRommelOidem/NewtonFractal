import { canvasToComplex, complexToCanvas } from "./state";
import { interpolateArray } from "d3";
import { clamp, circleComplex } from "./funcUtils";

export default function initSliders(canvas, uniforms, sliderContent, render, renderCursors, cursorGroup){
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
        slider.className = "slider"
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
                const newRoots = Array.from({length:numRoots}, (_, i)=>circleComplex(numRoots, i));
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
                const interpolators = extendedNewRoots.map((end,i)=>interpolateArray(extendedOldRoots[i],end))
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
    createSlider({
        name:"Roots", min:2, max:6, key:"u_numRoots"
    })
    createSlider({
        name:"Iterations", min:0, max:300, key:"u_iterations"
    })
}