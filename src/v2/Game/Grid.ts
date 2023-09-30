import { Color } from "../CellEngine/CellEngine";
import Point from "../CellEngine/Point";
import Line from "../CellEngine/Shape/Line";
import { Shape, ShapeStyle } from "../CellEngine/Shape/Shape";
import Square from "../CellEngine/Shape/Square";

class Grid extends Shape {
    tiles: Square[] = []
    lines: Line[] = []

    constructor(
        private startPoint: Point, 
        private endPoint: Point, 
        private gapSize: number,
        private styleConfig?: ShapeStyle
    ){
        super()
        
        for (let x = this.startPoint.x; x < this.endPoint.x; x += this.gapSize) {
            this.lines.push(
                new Line(
                    new Point(x, 0),
                    new Point(x, endPoint.y),
                    this.styleConfig
                )
            )
            for (let y = this.startPoint.y; y < this.endPoint.y; y += this.gapSize) {
                this.lines.push(
                    new Line(
                        new Point(0, y),
                        new Point(endPoint.x, y),
                        this.styleConfig
                    )
                )
            }
        }
    }

    draw = () => { 
        for (let l = 0; l < this.lines.length; l++) {
            this.lines[l].draw()
        }
    }
}

export default Grid