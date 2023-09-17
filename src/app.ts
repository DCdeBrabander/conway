import Conway from "./conway"

const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement
const ConwayInstance = new Conway(canvasElement)

const resizeCanvas = () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas, false);

window.addEventListener('mousedown', (event: MouseEvent) => {
    ConwayInstance.addCellAtCoordinate(event.clientX, event.clientY)
}, false);

resizeCanvas()

console.info(ConwayInstance)