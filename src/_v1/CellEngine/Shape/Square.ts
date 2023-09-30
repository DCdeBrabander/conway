import { Color, Point } from "../CellEngine";
import Rectangle from "./Rectangle";

class Square extends Rectangle {
    constructor(
        point: Point,
        size: number, 
        fillColor?: Color, 
        strokeColor?:Color
    ) {
        super(
            point, 
            { width: size, height: size }, 
            fillColor, 
            strokeColor
        )
    }
}

export default Square