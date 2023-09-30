import Conway from "./conway"
import { ui } from "./conway-ui"

export let ConwayGame: Conway
export let CanvasElement: HTMLCanvasElement

document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    // Conway Stuff
    const CELL_SIZE = 20
    const CONWAY_FPS = 15

    // Let's go ;-)
    ConwayGame = new Conway(CanvasElement, { fpsLimit: CONWAY_FPS, cellSize: CELL_SIZE })
        .setHeightOffset(document.querySelector('#info')?.clientHeight ?? 0)
        .initialize()

    // UI stuff
    ui()
})