import { CellEngine, Color } from "./CellEngine";
import Point from "./Point";
import Line from "./Shape/Line";
import { ShapeStyle } from "./Shape/Shape";
import Square from "./Shape/Square";

type TileConfig = ShapeStyle & {
    gapSize: number
}
class IsometricTile {
    constructor(
        private point: Point, 
        private styleConfig: TileConfig,
    ){}

    draw = () => {
        const gapSize = this.styleConfig.gapSize
        const sizeX = gapSize
        const sizeY = gapSize
        const sizeZ = gapSize
        
        const { x, y } = this.point

        CellEngine.context2d.beginPath()
        
        if (this.styleConfig.fillStyle) {
            CellEngine.context2d.fillStyle = this.styleConfig.fillStyle
        }
        if (this.styleConfig.strokeStyle) {
            CellEngine.context2d.strokeStyle = this.styleConfig.strokeStyle
        }
        if (this.styleConfig.lineWidth) {
            CellEngine.context2d.lineWidth = this.styleConfig.lineWidth
        }

        CellEngine.context2d.moveTo(x, y - sizeZ)

        CellEngine.context2d.lineTo(
            x - sizeX, 
            y - sizeZ - sizeX * 0.5
        )
        CellEngine.context2d.lineTo(
            x - sizeX + sizeY,
            y - sizeZ - (sizeX * 0.5 + sizeY * 0.5)
        )
        CellEngine.context2d.lineTo(
            x + sizeY,
            y - sizeZ - sizeY * 0.5
        )

        CellEngine.context2d.closePath()
        CellEngine.context2d.stroke()
        CellEngine.context2d.fill()
    }
}

export default IsometricTile