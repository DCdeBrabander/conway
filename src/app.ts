import Conway, { States } from "./conway"
import { Patterns } from "./patterns/index"

const app = () => {
    const stateInfoElement = document.getElementById("state")

    const CELL_SIZE = 20
    const CONWAY_FPS = 5
    const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement
    const supportedPatternsElement = document.getElementById("patterns") as HTMLSelectElement

    // Let's go ;-)
    const ConwayInstance = new Conway(canvasElement, CELL_SIZE, CONWAY_FPS)
        .setHeightOffset(document.querySelector('#info')?.clientHeight ?? 0)
        .init()

    ConwayInstance.getSupportedPatterns().forEach(
        (supportedPattern, index) => {
            
        const textValue = 
            supportedPattern.charAt(0).toUpperCase() 
            + supportedPattern.slice(1).toLowerCase()

        supportedPatternsElement.add(
            new Option(
                textValue,
                supportedPattern,
                index == 0
            )
        )
    })

    const getMouseCoordinates = (mouseEvent: MouseEvent) => ({
        x: mouseEvent.clientX - canvasElement.offsetLeft,
        y: mouseEvent.clientY - canvasElement.offsetTop
    })
    
    canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
        const { x, y } = getMouseCoordinates(event)
        ConwayInstance.showPattern(ConwayInstance.getCurrentPreviewPattern(), x, y)
    }, false)
    
    canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
        const { x, y } = getMouseCoordinates(event)
        ConwayInstance.showPatternPreview(ConwayInstance.getCurrentPreviewPattern(), x, y)
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

    supportedPatternsElement.addEventListener('change', () => {
        const patternValue = supportedPatternsElement.value as keyof typeof Patterns
        const selectedPattern = Patterns[patternValue] ?? Patterns.CELL
        ConwayInstance.setCurrentPreviewPattern(selectedPattern)
    })
}

document.addEventListener("DOMContentLoaded", () => app())