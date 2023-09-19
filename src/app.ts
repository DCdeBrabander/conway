import Conway, { States } from "./conway"
import { Patterns } from "./patterns/index"

const stateInfoElement = document.getElementById("state")

const CELL_SIZE = 20
const CONWAY_FPS = 5
const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement
const ConwayInstance = new Conway(canvasElement, CELL_SIZE, CONWAY_FPS)

// TODO: Make this editable by user
const currentPreviewPattern = Patterns.BLINKER

const getMouseCoordinates = (mouseEvent: MouseEvent) => {
    return {
        x: mouseEvent.clientX - canvasElement.offsetLeft,
        y: mouseEvent.clientY - canvasElement.offsetTop
    }
}

canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
    const { x, y } = getMouseCoordinates(event)
    ConwayInstance.insertPattern(currentPreviewPattern, x, y)
}, false);

canvasElement.addEventListener("mousemove", (event: MouseEvent) => {
    const { x, y } = getMouseCoordinates(event)
    ConwayInstance.showPatternPreview(currentPreviewPattern, x, y)
}, false)

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