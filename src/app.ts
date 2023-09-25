import Conway from "./conway"
import Conway2 from "./conway2"
import { ui } from "./ui"

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

    // new Conway2(
    //     CanvasElement, 
    //     { heightOffset: document.querySelector('#info')?.clientHeight ?? 0 } 
    // )

    // UI stuff
    ui()
})