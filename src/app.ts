import Conway, { States } from "./conway"
import { Patterns } from "./patterns/index"

const app = () => {
    // UI stuff
    const stateInfoElement = document.querySelector("#state span") as HTMLSpanElement

    const fpsElement = document.querySelector("#fps #target span") as HTMLSpanElement
    const realFpsElement = document.querySelector("#fps #actual span") as HTMLSpanElement

    const supportedPatternsElement = document.querySelector("#patterns select") as HTMLSelectElement
    const helpDialogElement = document.getElementById("help") as HTMLDialogElement

    // Conway Stuff
    const CELL_SIZE = 15
    const CONWAY_FPS = 20
    const canvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    // Let's go ;-)
    const ConwayGame = new Conway(canvasElement, CELL_SIZE, CONWAY_FPS)
        .setHeightOffset(document.querySelector('#info')?.clientHeight ?? 0)
        .init()

    ConwayGame.getSupportedPatterns().forEach(
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

    // All eventlisteners could be put within instance of Conway,
    // but pure game-of-life has no controls or any events
    const getMouseCoordinates = (mouseEvent: MouseEvent) => ({
        x: mouseEvent.clientX - canvasElement.offsetLeft,
        y: mouseEvent.clientY - canvasElement.offsetTop
    })

    const realFrameTime = () => { 
        realFpsElement.innerHTML = Math.floor(1000 / ConwayGame.getRealFrameTime()).toString()
        setTimeout(realFrameTime, 250)
    }
    
    canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
        const { x, y } = getMouseCoordinates(event)
        ConwayGame.showPattern(ConwayGame.getCurrentPreviewPattern(), x, y)
    }, false)
    
    canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
        const { x, y } = getMouseCoordinates(event)
        ConwayGame.showPatternPreview(ConwayGame.getCurrentPreviewPattern(), x, y)
    }, false)
    
    window.addEventListener('keyup', (event: KeyboardEvent) => {
        const pressedKey = event.key.toLowerCase()
    
        switch (pressedKey) {
            case "p":
                ConwayGame.setGameState(States.PAUSED)
                break
            case "h":
                if (!helpDialogElement.open) {
                    helpDialogElement.showModal()
                } else {
                    helpDialogElement.close()
                }
                break
            case " ": 
                ConwayGame.setGameState(
                    ConwayGame.currentState == States.RUNNING 
                    ? States.PAUSED
                    : States.RUNNING
                )
                break
            default:
                break
        }

        if (ConwayGame.currentState == States.RUNNING) {
            fpsElement.innerHTML = ConwayGame.fps.toString()
        } else {
            fpsElement.innerHTML = "0"
        }
    
        const currentState = Object.keys(States)[Object.values(States).indexOf(ConwayGame.currentState)]
        document.title = "Conway's Game of Life - " + currentState
        stateInfoElement!.innerHTML = currentState
    }, false)

    supportedPatternsElement.addEventListener('change', () => {
        const patternValue = supportedPatternsElement.value as keyof typeof Patterns
        const selectedPattern = Patterns[patternValue] ?? Patterns.CELL
        ConwayGame.setCurrentPreviewPattern(selectedPattern)
    })

    realFrameTime()
}

document.addEventListener("DOMContentLoaded", () => app())