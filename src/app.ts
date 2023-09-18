import Conway, { States } from "./conway"

const stateInfoElement = document.getElementById("state")

const CELL_SIZE = 20
const CONWAY_FPS = 5
const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement
const ConwayInstance = new Conway(canvasElement, CELL_SIZE, CONWAY_FPS)

canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
    const correctX = event.clientX - canvasElement.offsetLeft
    const correctY = event.clientY - canvasElement.offsetTop
    ConwayInstance.toggleCellAtCoordinate(correctX, correctY)
}, false);

window.addEventListener('keyup', (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase()

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
            break
    }

    const currentState = Object.keys(States)[Object.values(States).indexOf(ConwayInstance.currentState)]
    document.title = "Conway's Game of Life - " + currentState
    stateInfoElement!.innerHTML = currentState
}, false)

canvasElement.addEventListener("mousemove", (event: MouseEvent) => {
    ConwayInstance.showPreviewCell(
        event.clientX - canvasElement.offsetLeft,
        event.clientY - canvasElement.offsetTop
    )
}, false)