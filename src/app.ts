import Conway from "./conway"

const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

const resizeCanvas = () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas, false);

resizeCanvas()

const ConwayInstance = new Conway(canvasElement)

console.info(ConwayInstance)