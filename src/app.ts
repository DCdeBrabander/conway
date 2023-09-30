import SomeGame from "./v2/game"

export let Game: SomeGame
export let CanvasElement: HTMLCanvasElement

document.addEventListener("DOMContentLoaded", () => {
    CanvasElement = document.getElementById("conway-canvas") as HTMLCanvasElement

    
    // Let's go ;-)
    Game = new SomeGame(CanvasElement, { fpsLimit: 20, tileSize: 20 })

    // we want 'true 2:1' ratio for our isometric shiz 
    // let tileSize = 50
    // let mouseTileSize = tileSize / 2
    // let tileWidth = 100
    // let tileHeight = 50

    // let worldOffsetX = width / 2
    // let worldOffsetY = 200
})