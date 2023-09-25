import { CellEngine, Color, Dimension, Point } from "../CellEngine"
import { Shape } from "./Shape"

class Rectangle implements Shape {
    constructor(
        private point: Point,
        private dimension: Dimension,
        private fillColor?: Color,
        private strokeColor?: Color
    ) {}

    draw(){
        //    CellEngine.context2d.fillRect(
        //         this.point.x, 
        //         this.point.y, 
        //         this.dimension.width, 
        //         this.dimension.height
        //     )

        CellEngine.context2d.beginPath()
      
        CellEngine.context2d.rect(
            this.point.x,
            this.point.y, 
            this.dimension.width,
            this.dimension.height
        )

        if (this.fillColor) {
            CellEngine.context2d.fillStyle = this.fillColor.toString()
            CellEngine.context2d.fill()
        }

        if (this.strokeColor) {
            CellEngine.context2d.lineWidth = 2
            CellEngine.context2d.strokeStyle = this.strokeColor.toString()
            CellEngine.context2d.stroke()
        }
    }
}

export default Rectangle