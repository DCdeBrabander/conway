import { CellEngine } from "../CellEngine/CellEngine"
import { Color } from "../CellEngine/Color"
import Point from "../CellEngine/Point"
import { Shape } from "../CellEngine/Shape/Shape"
import Square from "../CellEngine/Shape/Square"

class Cell implements Shape {
    private shape: Shape
    private color: Color = new Color("#FFF")

    constructor (
        public point: Point = new Point(0, 0),
        public size: number = 0,
        public alive: boolean = true,
        public preview: boolean = false,
        public aliveNeighbours: number = 0
    ) {
        this.color = preview 
            ? new Color(this.color.getShade(-20)) 
            : this.color
        
        this.shape = new Square(
            point,
            size,
            this.color
        )
    }

    setColor = (color: Color) => {
        this.color = color
        return this
    }

    setAliveNeighbours = (amount: number) => this.aliveNeighbours = amount 
 
    draw = () => {
        if (this.color && CellEngine.context2d.fillStyle !== this.color.toString()) {
            CellEngine.context2d.fillStyle = this.color.toString()
        }
        this.shape.draw()
    }
}

export default Cell