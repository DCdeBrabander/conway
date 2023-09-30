import { Point3D } from "./Point";
import Shape from "./Shape/Shape";

export class Player extends Shape {

    private moveSpeed = 1

    private nextPosition: Point3D = new Point3D(0, 0, 0)

    constructor(private asset: Shape, player: number = 1) {
        super("Player_" + player)

        // Increase priority of drawing over other (surrounding) tiles
        this.drawPriorityOffset = 3 // TODO rethink this workaround 'fix'

        this.position = asset.position
        this.dimension = asset.dimension

        this.asset = asset.show()

        this.canCollide = true
        
        this.bindKeyListener()
    }

    update = () => {
        this.findNeighbours()?.forEach((neighbourShape: Shape) => {
            if (this.isPointCollidingWith(this.nextPosition, neighbourShape)) {
                console.log("YES")
            }
        })
        // Player instance position is not (yet?) same as the asset (visual/shape) position
        this.updatePosition(this.nextPosition)
        this.asset.updatePosition(this.nextPosition)

        this.updatable = false
    }



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
                break
        }
        this.updatable = true
    }
}