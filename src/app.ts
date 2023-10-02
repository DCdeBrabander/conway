import SomeGame from "./v2/game"

export let Game: SomeGame
export let CanvasElement: HTMLCanvasElement

document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    // Let's go ;-)
    Game = new SomeGame(CanvasElement, { fpsLimit: 2, tileSize: 50 })
})