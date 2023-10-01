import { CellEngine, Color, Point } from "../CellEngine"
import { Shape, ShapeStyle } from "./Shape"

class Line extends Shape {
    constructor(
        private startPoint: Point,
        private endPoint: Point,
        private style?: ShapeStyle
    ) {
        super("Line")
    }

    draw = () => {
        const ctx = this.engineInstance?.getRenderer().getContext()!

        if (this.style?.strokeStyle) {
            ctx.strokeStyle = this.style?.strokeStyle
        }
        if (this.style?.lineWidth) {
            ctx.lineWidth = this.style?.lineWidth
        }

        ctx.beginPath()
        
        ctx.moveTo(this.startPoint.x, this.startPoint.y)
        ctx.lineTo(this.endPoint.x, this.endPoint.y)
        
        ctx.stroke()
    }
}

export default Line