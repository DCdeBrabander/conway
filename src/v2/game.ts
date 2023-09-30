import { CellConfig, CellEngine, CellMath, Color, DrawMode, Point } from "./CellEngine/CellEngine"
import IsometricTile from "./CellEngine/IsometricTile"
import { Player } from "./CellEngine/Player"
import { Point3D } from "./CellEngine/Point"
import Cube from "./CellEngine/Shape/Cube"
import Square from "./CellEngine/Shape/Square"
import Level from "./Game/Level"
import IsometricGrid from "./Game/Level"
import level_1 from "./Game/Map/level_1"

type SomeGameConfig = CellConfig & {
    tileSize: number,
    heightOffset?: number
}

class SomeGame extends CellEngine {
    private theme = {
        grid:  {
            strokeStyle: new Color("#888")
        },
        cell: {
            alive: new Color("#FFF"),
            example: new Color("#AAA"),
        },
        background: new Color("#222")
    }

    public onMouseTile!: Square
    public grid!: IsometricGrid

        // we want 'true 2:1' ratio for our isometric shiz 
    private tileSize = 50
    // private tileWidth = this.tileSize * 2
    // private tileHeight = this.tileSize

    private mouseTileSize = this.tileSize / 2

    // private worldOffsetX: number = 0
    // private worldOffsetY: number = 0

    private mouseTile = new Cube(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide()
    private player: Player | null = null
    private level: Level = new Level(0, 0)

    constructor (
        canvasElement: HTMLCanvasElement, 
        private instanceConfig: SomeGameConfig = { 
            tileSize: 20,
            fpsLimit: 60
        }
    ) {
        super(canvasElement)
        this.setConfig({ fpsLimit: this.instanceConfig.fpsLimit ?? 5})
        
        this.setCanvasSize(
            window.innerWidth,
            window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
        )

        this.loadGame()

        return this
    }

    loadGame = () => {
        this.mouseTile = new Cube(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide()

        this.player = new Player(
            new Cube(
                new Point3D(10, 10, 2),
                this.tileSize, 
                new Color("#FF0000")
            )
        )

        this.level = this.loadLevel(1)

        this.loadAssets()

        this.bindGeneralListeners()

        this.onResize(() => {
            this.setCanvasSize(
                window.innerWidth,
                window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
            )
        } )
    }

    // Can be used later to dynamically parts of the world?
    loadLevel = (level: number): Level => {
        return new Level(1, this.tileSize)
    }

    bindGeneralListeners = () => {
        // mousemovement demo
        this.on('mousemove', (event: MouseEvent) => {
            const x = Math.floor((event.clientY / this.mouseTileSize) + (event.clientX / (this.mouseTileSize * 2)))
            const y = Math.floor((-event.clientX / (this.mouseTileSize * 2)) + (event.clientY / this.mouseTileSize))

            this.mouseTile.updatePosition(new Point3D(x, y, 0))

            this.mouseTile.show()
        })
        this.on('mouseleave', (event: MouseEvent) => {
            this.mouseTile.hide()
        })
    }

    loadAssets = () => {
        this.addShape(this.level, DrawMode.ISOMETRIC)
        this.addShape(this.player!, DrawMode.ISOMETRIC)

        this.addShape(this.mouseTile)
    }

    onResize = (onResizeCallback: Function) => {
        this.on("resize", onResizeCallback, window)
    }
}

export default SomeGame