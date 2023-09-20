import Conway from "./conway"
import { ui } from "./ui"

export let ConwayGame: Conway

export let CanvasElement: HTMLCanvasElement

const app = () => {
    CanvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    // Conway Stuff
    const CELL_SIZE = 15
    const CONWAY_FPS = 20

    // Let's go ;-)
    ConwayGame = new Conway(CanvasElement, CELL_SIZE, CONWAY_FPS)
        .setHeightOffset(document.querySelector('#info')?.clientHeight ?? 0)
        .init()

    // UI stuff
    ui()
}

document.addEventListener("DOMContentLoaded", () => app())