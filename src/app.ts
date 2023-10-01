import SomeGame from "./v2/game"

export let Game: SomeGame
export let CanvasElement: HTMLCanvasElement

document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    // Let's go ;-)
    Game = new SomeGame(CanvasElement, { fpsLimit: 20, tileSize: 50 })

    // we want 'true 2:1' ratio for our isometric shiz 

    // let mouseTileSize = tileSize / 2


    // let worldOffsetX = width / 2
    // let worldOffsetY = 200
})