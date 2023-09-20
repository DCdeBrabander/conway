import { ConwayGame } from "./app"
import { States } from "./conway"
import { Patterns } from "./patterns/index"

// Main header
export let stateInfoElement: HTMLSpanElement
// Help dialog/modal (press 'H')
export let helpDialogElement: HTMLDialogElement
// FPS
export let targetFpsElement: HTMLSpanElement
export let realFpsElement: HTMLSpanElement
// Pattern Dropdown
export let supportedPatternsElement: HTMLSelectElement
// Control buttons
export let controlPlayButtonElement: HTMLButtonElement
export let controlTickButtonElement: HTMLButtonElement

/**
 * All eventlisteners could be put within instance of Conway,
 * but pure game-of-life has no controls or any events
 */
export const ui = () => {
    controlPlayButtonElement = document.getElementById("control-play") as HTMLButtonElement
    controlTickButtonElement = document.getElementById("control-tick") as HTMLButtonElement
    stateInfoElement = document.querySelector("#state span") as HTMLSpanElement
    helpDialogElement = document.getElementById("help") as HTMLDialogElement
    targetFpsElement = document.querySelector("#fps #target span") as HTMLSpanElement
    realFpsElement = document.querySelector("#fps #actual span") as HTMLSpanElement
    supportedPatternsElement = document.querySelector("#patterns select") as HTMLSelectElement

    supportedPatternsElement.addEventListener('change', () => {
        const patternValue = supportedPatternsElement.value as keyof typeof Patterns
        const selectedPattern = Patterns[patternValue] ?? Patterns.CELL
        ConwayGame.setCurrentPreviewPattern(selectedPattern)
    })
    
    initializeControlButtons()

    initializeMouseListener()
    initializeKeyboardListener()

    updateSupportedPatternSelect()
    updateRealFrameTimeInElement()
}

const initializeControlButtons = () => {
    controlTickButtonElement.onclick = () => {
        ConwayGame.allowTick = true
        ConwayGame.setGameState(States.SINGLE_TICK)
    }

    controlPlayButtonElement.onclick = () => {
        if (ConwayGame.currentState == States.RUNNING) {
            ConwayGame.setGameState(States.PAUSED)
        } else {
            ConwayGame.setGameState(States.RUNNING)
        }

        updateUiElementsByGameState()
    }
}

const initializeMouseListener = () => {
    ConwayGame.canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
        const { x, y } = getCorrectedMouseCoordinates(event, ConwayGame.canvasElement)
        ConwayGame.showPattern(ConwayGame.getCurrentPreviewPattern(), x, y)
    }, false)

    ConwayGame.canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
        const { x, y } = getCorrectedMouseCoordinates(event, ConwayGame.canvasElement)
        ConwayGame.showPatternPreview(ConwayGame.getCurrentPreviewPattern(), x, y)
    }, false)
}

const initializeKeyboardListener = () => {
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

        updateUiElementsByGameState()
    }, false)
}

const updateSupportedPatternSelect = () => ConwayGame.getSupportedPatterns().forEach(
    (supportedPattern: string, index: number) => {
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
    }
)

/**
 * Show user actual time it took to calculate frames
 */
const updateRealFrameTimeInElement = () => {
    realFpsElement.innerHTML = ConwayGame.currentState == States.RUNNING 
        ? Math.floor(1000 / ConwayGame.getRealFrameTime()).toString() 
        : "0"
    setTimeout(updateRealFrameTimeInElement, 250)
}

const updateUiElementsByGameState = () => {
    const gameStateString = Object.keys(States)[Object.values(States).indexOf(ConwayGame.currentState)]
    document.title = "Conway's Game of Life - " + gameStateString
    stateInfoElement!.innerHTML = gameStateString

    // Update play button
    if (ConwayGame.currentState == States.RUNNING) {
        controlPlayButtonElement.innerText = "> Play"
        targetFpsElement.innerHTML = ConwayGame.fps.toString()
    } else {
        controlPlayButtonElement.innerText = "|| Pause"
        targetFpsElement.innerHTML = "0"
    }
}

const getCorrectedMouseCoordinates = (mouseEvent: MouseEvent, canvasElement: HTMLCanvasElement) => ({
    x: mouseEvent.clientX - canvasElement.offsetLeft,
    y: mouseEvent.clientY - canvasElement.offsetTop
})