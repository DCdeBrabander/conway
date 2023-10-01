import { CellConfig, CellEngine, Color, DrawMode } from "./CellEngine/CellEngine"
import { Player } from "./CellEngine/Player"
import { Point3D } from "./CellEngine/Point"
import Cube from "./CellEngine/Shape/Isometric/Cube"
import Square from "./CellEngine/Shape/Square"
import Level from "./Game/Level"
import IsometricGrid from "./Game/Level"

type SomeGameConfig = CellConfig & {
    tileSize: number,
    heightOffset?: number
}


const DEFAULT_CONFIG: SomeGameConfig = {
    tileSize: 20,
    fpsLimit: 60
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

    static TILE_SIZE = 50

    private mouseTileSize = SomeGame.TILE_SIZE / 2

    private mouseTile = new Cube(new Point3D(0, 0, 2), this.mouseTileSize, new Color("#0000FF")).hide()
    private player: Player | null = null
    private level: Level = new Level(0, 0)

    constructor (
        canvasElement: HTMLCanvasElement, 
        private instanceConfig: SomeGameConfig = DEFAULT_CONFIG
    ) {
        super(canvasElement)
        this.setConfig({ fpsLimit: this.instanceConfig.fpsLimit ?? 1})
        
        this.getRenderer().setCanvasSize(
            window.innerWidth,
            window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
        )

        SomeGame.TILE_SIZE = this.instanceConfig.tileSize ?? 50

        this.loadGame()

        return this
    }

    loadGame = () => {
        this.level = this.loadLevel(1)

        this.loadAssets()

        this.bindGeneralListeners()

        this.onResize(() => {
            this.getRenderer().setCanvasSize(
                window.innerWidth,
                window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
            )
        } )
    }

    // Can be used later to dynamically parts of the world?
    loadLevel = (level: number): Level => {
        return new Level(level, SomeGame.TILE_SIZE)
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
        this.mouseTile = new Cube(
            new Point3D(0, 0, 2), 
            this.mouseTileSize, 
            new Color("#0000FF")
        ).hide()

        this.player = new Player(
            new Cube(
                new Point3D(6, 6, 2),
                SomeGame.TILE_SIZE, 
                new Color("#FF0000")
            )
        ).show()

        this.addShape(this.level, DrawMode.ISOMETRIC)
        this.addShape(this.player!, DrawMode.ISOMETRIC)
        this.addShape(this.mouseTile)
    }

    onResize = (onResizeCallback: Function) => {
        this.on("resize", onResizeCallback, window)
    }
}

export default SomeGame