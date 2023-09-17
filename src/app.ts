import Conway, { States } from "./conway"

const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

const resizeCanvas = () => {
    canvasElement.width = window.innerWidth
    canvasElement.height = window.innerHeight
}
resizeCanvas()


const ConwayInstance = new Conway(canvasElement)

window.addEventListener('mousedown', (event: MouseEvent) => {
    ConwayInstance.addCellAtCoordinate(event.clientX, event.clientY)
}, false);

window.addEventListener('keyup', (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase() ?? null
    switch (pressedKey) {
        case "p":
            ConwayInstance.setGameState(States.PAUSED)
            break

        case " ": 
            ConwayInstance.setGameState(
                ConwayInstance.currentState == States.RUNNING 
                ? States.PAUSED
                : States.RUNNING
            )
            break
        default: 
            ConwayInstance.setGameState(States.RUNNING)
            return
    }
}, false)

window.addEventListener('resize', resizeCanvas, false);

console.info(ConwayInstance)