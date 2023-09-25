import { CellEngine, Color, Point } from "../CellEngine"
import { Shape } from "./Shape"

class Cube implements Shape {
    constructor(
        private point: Point, 
        private size: number,
        private mainColor: Color
    ){}

    draw(){
        // const mainColor = this
        const leftColor = new Color(this.mainColor.getShade(20))
        const rightColor = new Color(this.mainColor.getShade(-20))

        const sizeX = this.size
        const sizeY = this.size
        const sizeZ = this.size
        
        // left face
        CellEngine.context2d.beginPath()

        CellEngine.context2d.moveTo(this.point.x, this.point.y)
        CellEngine.context2d.lineTo(this.point.x - sizeX, this.point.y - sizeX * 0.5)
        CellEngine.context2d.lineTo(this.point.x - sizeX, this.point.y - sizeZ - sizeX * 0.5)
        CellEngine.context2d.lineTo(this.point.x, this.point.y - sizeZ * 1)
        CellEngine.context2d.closePath()

        CellEngine.context2d.fillStyle = leftColor.toString()
        CellEngine.context2d.strokeStyle = leftColor.getShade(20)

        CellEngine.context2d.stroke()
        CellEngine.context2d.fill()
    
        // right face
        CellEngine.context2d.beginPath()
        CellEngine.context2d.moveTo(this.point.x, this.point.y)
        CellEngine.context2d.lineTo(this.point.x + sizeY, this.point.y - sizeY * 0.5)
        CellEngine.context2d.lineTo(this.point.x + sizeY, this.point.y - sizeZ - sizeY * 0.5)
        CellEngine.context2d.lineTo(this.point.x, this.point.y - sizeZ * 1)
        CellEngine.context2d.closePath()
        CellEngine.context2d.fillStyle = rightColor.toString()
        CellEngine.context2d.strokeStyle = rightColor.getShade(40)
        CellEngine.context2d.stroke()
        CellEngine.context2d.fill()
    
        // center face
        CellEngine.context2d.beginPath()
        CellEngine.context2d.moveTo(this.point.x, this.point.y - sizeZ)
        CellEngine.context2d.lineTo(this.point.x - sizeX, this.point.y - sizeZ - sizeX * 0.5)
        CellEngine.context2d.lineTo(this.point.x - sizeX + sizeY, this.point.y - sizeZ - (sizeX * 0.5 + sizeY * 0.5))
        CellEngine.context2d.lineTo(this.point.x + sizeY, this.point.y - sizeZ - sizeY * 0.5)
        CellEngine.context2d.closePath()

        CellEngine.context2d.fillStyle = this.mainColor.toString()
        CellEngine.context2d.strokeStyle = this.mainColor.getShade(-40)

        CellEngine.context2d.stroke()
        CellEngine.context2d.fill()
    }
}