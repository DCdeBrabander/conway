import { CellEngine, Color } from "../CellEngine/CellEngine";
import IsometricTile from "../CellEngine/IsometricTile";
import Point from "../CellEngine/Point";
import Line from "../CellEngine/Shape/Line";
import { ShapeStyle } from "../CellEngine/Shape/Shape";
import Square from "../CellEngine/Shape/Square";

type GridConfig = ShapeStyle & {
    gapSize: number
}
class IsometricGrid {
    private tiles: IsometricTile[] = []

    constructor(
        private startPoint: Point, 
        private endPoint: Point,
        private styleConfig: GridConfig,
    ){
        const gapSize = this.styleConfig.gapSize

        // ???
        let offsetX = gapSize * 2.25
        let offsetY = gapSize * 1.25

        for (let x = this.startPoint.x; x < this.endPoint.x; x += offsetX) {
            for (let y = this.startPoint.y; y < this.endPoint.y; y += offsetY) {

                this.tiles.push(
                    new IsometricTile(
                        new Point(x, y),
                        styleConfig
                    )
                )
            }
        }
    }

    draw = () => {
        for (let s = 0; s < this.tiles.length; s++) {
            if (this.styleConfig.strokeStyle && CellEngine.context2d.strokeStyle !== this.styleConfig.strokeStyle) {
                CellEngine.context2d.strokeStyle = this.styleConfig.strokeStyle
            }
            if (this.styleConfig.fillStyle && CellEngine.context2d.fillStyle !== this.styleConfig.fillStyle) {
                CellEngine.context2d.fillStyle = this.styleConfig.fillStyle
            }
            this.tiles[s].draw()
        }
    }
}

export default IsometricGrid