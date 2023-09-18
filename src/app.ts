import Conway, { States } from "./conway"

const CELL_SIZE = 20
const CONWAY_FPS = 5
const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement
const ConwayInstance = new Conway(canvasElement, CELL_SIZE, CONWAY_FPS)

canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
    ConwayInstance.toggleCellAtCoordinate(event.clientX, event.clientY)
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

    document.title = "Conway - " + Object.keys(States)[Object.values(States).indexOf(ConwayInstance.currentState)]
}, false)