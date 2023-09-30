import { CellEngine, Color, Point } from "../CellEngine"
import { Shape, ShapeStyle } from "./Shape"

class Line implements Shape {
    constructor(
        private startPoint: Point,
        private endPoint: Point,
        private style?: ShapeStyle
    ) {}

    draw = () => {
        if (this.style?.strokeStyle) {
            CellEngine.context2d.strokeStyle = this.style?.strokeStyle
        }
        if (this.style?.lineWidth) {
            CellEngine.context2d.lineWidth = this.style?.lineWidth
        }

        CellEngine.context2d.beginPath()
        
        CellEngine.context2d.moveTo(this.startPoint.x, this.startPoint.y)
        CellEngine.context2d.lineTo(this.endPoint.x, this.endPoint.y)
        
        CellEngine.context2d.stroke()
    }
}

export default Line