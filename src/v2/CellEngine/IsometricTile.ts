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

        // const baseLine = new Point(this.point.x, this.point.y).toIsometric()
        // Math.floor(this.point.x - gapSize + gapSize),
        // Math.floor(this.point.y - gapSize * 2)
        
        // Math.floor(this.point.x + gapSize),
        // Math.floor(this.point.y - gapSize - gapSize * 0.5)  

        
        if (this.styleConfig.fillStyle) {
            CellEngine.context2d.fillStyle = this.styleConfig.fillStyle
        }
        if (this.styleConfig.strokeStyle) {
            CellEngine.context2d.strokeStyle = this.styleConfig.strokeStyle
        }
        if (this.styleConfig.lineWidth) {
            CellEngine.context2d.lineWidth = this.styleConfig.lineWidth
        }
        
        
        CellEngine.context2d.beginPath()
        CellEngine.context2d.strokeRect(this.point.x, this.point.y, gapSize, gapSize)

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

        CellEngine.context2d.closePath()
        CellEngine.context2d.stroke()
        CellEngine.context2d.fill()
    }
}

export default IsometricTile