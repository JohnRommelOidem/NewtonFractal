export default function initMinimize(sliderContent){
    const sliderContainer = document.getElementById("slider-container")
    const minBtn = document.getElementById("min-btn")
    sliderContainer.prepend(minBtn);
    minBtn.addEventListener("click",()=>{
        sliderContainer.classList.toggle("minimized")
        sliderContent.classList.toggle("minimized")
        minBtn.classList.toggle("minimized")
    })
}