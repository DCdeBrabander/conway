import { CellEngine } from "./CellEngine"
import { Color } from "./Color"
import { Point3D } from "./Point"
import Renderer, { DrawMode } from "./Renderer"
import BoundingBox from "./Shape/BoundingBox"
import Shape from "./Shape/Shape"

export enum MoveDirection  {
    UP = "UP",
    UP_LEFT = "UP_LEFT",
    LEFT = "LEFT",
    DOWN_LEFT = "DOWN_LEFT",
    DOWN = "DOWN",
    DOWN_RIGHT = "DOWN_RIGHT",
    RIGHT = "RIGHT",
    UP_RIGHT = "UP_RIGHT",
}

export class Player {
    public className = "Player_" + 0

    private moveSpeed = 0.5
    private newPosition: Point3D = new Point3D(0, 0, 0)
    private currentDirection: MoveDirection|null = null

    public updatable: boolean = false

    constructor(public asset: Shape, player: number = 1) {
        this.className = "Player_" + player
        this.asset = asset.show()
        this.asset.elevation = 2
        this.asset.updateDimension(this.asset.dimension)
        this.asset.updatePosition(this.asset.position)
        this.newPosition = this.asset.position

        // Increase priority of drawing over other (surrounding) tiles
        this.asset.drawPriorityOffset = 5
        this.asset.canCollide = true
        
        // console.log(this.asset.getNormalizedPosition())


        this.bindKeyListener()
    }

    bind = (instance: CellEngine) => {
        this.asset.engine = instance
    }

    canMove = (): boolean => {

        console.log(
            this.asset.getFullPositionString(),
            // this.asset.getRenderer()?.getIndexedAssets(DrawMode.ISOMETRIC).get(this.asset.getFullPositionString())
        )

        return true
    }

    update = () => {
        let isColliding = false

        if (this.updatable && this.currentDirection && !this.canMove()) {
            // ...
            isColliding = true
        }

        if ( ! isColliding) {
            this.updatePosition(this.newPosition)
        }

        this.updatable = false
    }

    // updateNeighbours = () => this.asset.setNeighbours( this.asset.findNeighbours() ?? [] )

    updatePosition = (position: Point3D) => this.asset.updatePosition(position)

    draw = () => this.asset.draw()

    bindKeyListener() {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            if ( ! event.key || event.key.length < 1) {
                console.log("Cant process onkeydown listener?")
                return
            }
            this.onKeyDownHandler(event.key)            
        }, false)
    }

    onKeyDownHandler = (key: string) => {
        switch (key) {
            case "ArrowUp":
                this.currentDirection = MoveDirection.UP
                this.newPosition = { ...this.asset.position, y: this.asset.position.y - this.moveSpeed }
                break
            case "ArrowDown":
                this.currentDirection = MoveDirection.DOWN
                this.newPosition = { ...this.asset.position, y: this.asset.position.y + this.moveSpeed }
                break
            case "ArrowLeft":
                this.currentDirection = MoveDirection.LEFT
                this.newPosition = { ...this.asset.position, x: this.asset.position.x - this.moveSpeed }
                break
            case "ArrowRight":
                this.currentDirection = MoveDirection.RIGHT
                this.newPosition = { ...this.asset.position, x: this.asset.position.x + this.moveSpeed }
                break
            default:
                this.currentDirection = null
                return
        }
        this.updatable = true
    }
}