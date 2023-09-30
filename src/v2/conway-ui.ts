import { States } from "./CellEngine/CellEngine"
import { ConwayGame } from "./v1/app"
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
}