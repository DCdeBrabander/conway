import { CellEngine, Color } from "../CellEngine/CellEngine";
import Point from "../CellEngine/Point";
import Line from "../CellEngine/Shape/Line";
import Shape, { ShapeStyle } from "../CellEngine/Shape/Shape";
import Square from "../CellEngine/Shape/Square";

type TileConfig = ShapeStyle & {
    gapSize: number
}
class IsometricTile extends Shape {
    constructor(
        public point: Point, 
        public styleConfig: TileConfig,
    ){
        super()
    }

    draw = () => {
        const gapSize = this.styleConfig.gapSize
        const ctx = this.engineInstance?.getContext()!

        if (this.styleConfig.fillStyle) {
            ctx.fillStyle = this.styleConfig.fillStyle
        }
        if (this.styleConfig.strokeStyle) {
            ctx.strokeStyle = this.styleConfig.strokeStyle
        }
        if (this.styleConfig.lineWidth) {
            ctx.lineWidth = this.styleConfig.lineWidth
        }
        
        ctx.beginPath()
        ctx.strokeRect(this.point.x, this.point.y, gapSize, gapSize)

        // CellEngine.context2d.moveTo(
        //     Math.floor(this.point.x), 
        //     this.point.y - gapSize
        // )
        
        // CellEngine.context2d.lineTo(
        //     Math.floor(this.point.x - gapSize), 
        //     Math.floor(this.point.y - gapSize - gapSize * 0.5)
        // )

        // CellEngine.context2d.lineTo(
        //     Math.floor(this.point.x - gapSize + gapSize),
        //     Math.floor(this.point.y - gapSize * 2)
        // )

        // CellEngine.context2d.lineTo(
        //     Math.floor(this.point.x + gapSize),
        //     Math.floor(this.point.y - gapSize - gapSize * 0.5)
        // )

        ctx.closePath()
        ctx.stroke()
        ctx.fill()
    }
}

export default IsometricTile