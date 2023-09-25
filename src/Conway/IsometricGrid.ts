import { Color } from "../CellEngine/CellEngine";
import Point from "../CellEngine/Point";
import Line from "../CellEngine/Shape/Line";

class IsometricGrid {
    lines: Line[] = []
    constructor(
        private startPoint: Point, 
        private endPoint: Point, 
        private gapSize: number
    ){
        for (let x = this.startPoint.x; x < this.endPoint.x; x += this.gapSize) {
            for (let y = this.startPoint.y; y < this.endPoint.y; y += this.gapSize) {
                let isometricStartPoint = new Point(x, y).toIsometric()
                let isometricEndpoint = isometricStartPoint
                this.lines.push(
                    new Line(
                        isometricStartPoint,
                        new Point(
                            isometricStartPoint.x + this.gapSize,
                            isometricStartPoint.y + this.gapSize
                        ),
                        { strokeStyle: new Color("#FFF").toString() }
                    )
                )
                // this.lines.push(
                //     new Square(
                //         new Point(x, y), 
                //         this.gapSize,
                //         new Color("#444"),
                //         new Color("#000")
                //     )
                // )
            }
        }
    }

    draw = () => {
        // for (let x = this.startPoint.x; x < this.endPoint.x; x += this.gapSize) {
        //     for (let y = this.startPoint.y; y < this.endPoint.y; y += this.gapSize) {
        //         new Line().draw()
        //     }
        // }
        for (let s = 0; s < this.lines.length; s++) {
            this.lines[s].draw()
        }
    }
}

export default IsometricGrid