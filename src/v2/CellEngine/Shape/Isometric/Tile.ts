import Point from "../../Point";
import Shape, { ShapeStyle } from "../Shape";

type TileConfig = ShapeStyle & {
    gapSize: number
}
class Tile extends Shape {
    constructor(
        public point: Point, 
        public styleConfig: TileConfig,
    ){
        super()
    }

    draw = () => {
        const gapSize = this.styleConfig.gapSize
        const ctx = this.engineInstance?.getRenderer().getContext()!

        if (this.styleConfig.fillStyle) {
            ctx.fillStyle = this.styleConfig.fillStyle
        }
        if (this.styleConfig.strokeStyle) {
            ctx.strokeStyle = this.styleConfig.strokeStyle
        }
        if (this.styleConfig.lineWidth) {
            ctx.lineWidth = this.styleConfig.lineWidth
        }

        // TODO
        // isometric tile == cube with z=1 ??
        
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

export default Tile