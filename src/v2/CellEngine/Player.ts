import { CellEngine } from "./CellEngine";
import { Color } from "./Color";
import { Point3D } from "./Point";
import BoundingBox from "./Shape/BoundingBox";
import Shape from "./Shape/Shape";

export class Player extends Shape {

    private moveSpeed = 0.4
    private nextPosition: Point3D = new Point3D(0, 0, 0)

    constructor(private asset: Shape, player: number = 1) {
        super("Player_" + player)

        // Increase priority of drawing over other (surrounding) tiles
        this.drawPriorityOffset = 3 // TODO rethink this workaround 'fix'

        this.position = asset.position
        this.dimension = asset.dimension

        this.asset.engineInstance = this.engineInstance
        this.asset = asset.show()

        this.canCollide = true
        
        this.bindKeyListener()
    }

    update = () => {
        console.log("Try updating to new position: ", this.nextPosition)

        let isColliding = false
        
        this.updateNeighbours()
        const currentNeighbours = this.getCurrentNeighbours()
        
        console.log("Searched and updated current neighbour shapes of player: ", currentNeighbours.length)
        
        if (currentNeighbours.length) {
            const newBoundingBox = new BoundingBox(this.nextPosition, this.dimension)
            
            for (const otherShape of currentNeighbours) {
                if (newBoundingBox.intersects(otherShape.boundingBox)){
                    console.info("Colliding with", otherShape.className)
                    isColliding = true
                    // this.updatable = false
                    return
                }
            }
        }

        if ( ! isColliding) {
            console.info('no collision? moving to ', this.nextPosition)
            // Player instance position is not (yet?) same as the asset (visual/shape) position
            this.moveTo(this.nextPosition)
        }

        this.updatable = false
    }

    updateNeighbours = () => {
        this.setNeighbours( this.findNeighbours() ?? [] )
    }

    moveTo = (position: Point3D) => {
        this.updatePosition(position)
        this.asset.updatePosition(position)
    }

    draw = () => {
        if (! this.asset.engineInstance ) {
            this.asset.engineInstance = this.engineInstance
        }
        this.updateNeighbours()

        this.asset.draw()
    }

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
                this.nextPosition = {...this.position, y: this.position.y - this.moveSpeed }
                break
            case "ArrowDown":
                this.nextPosition = {...this.position, y: this.position.y + this.moveSpeed }
                break
            case "ArrowLeft":
                this.nextPosition = {...this.position, x: this.position.x - this.moveSpeed }
                break
            case "ArrowRight":
                this.nextPosition = {...this.position, x: this.position.x + this.moveSpeed }
                break
            default:
                return
        }
        this.updatable = true
    }
}