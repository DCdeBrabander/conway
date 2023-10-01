import SomeGame from "../../../game";
import { Color } from "../../CellEngine";
import { Point3D } from "../../Point";
import Shape from "../Shape";

class Cube extends Shape {
    constructor(position: Point3D, private size: number, public color: Color = new Color("#F00")){
        super()
        this.position = position

        // Ratio 2:1
        // TODO abstract this to more central engine isometric logic
        this.dimension.width = size ? (size * 2) : (SomeGame.TILE_SIZE * 2)
        this.dimension.height = size ? size : SomeGame.TILE_SIZE

        this.updateDimension(this.dimension)
    }

    outline = (color?: Color) => {
        const ctx = this.engineInstance?.getRenderer().getContext()!

        const strokeColor = color?.toString() ?? this.highlightColor?.toString() ?? new Color("#AAAAAA").toString()

        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2

        // Size of Cube
        const sizeX = this.dimension.width
        const sizeY = this.dimension.height
        
        // save context state before drawing
        ctx.save()
        
        // move canvas 'origin' 
        // translate X = tile X position MINUS Y position, mulitplied by half tile widths to fit the translation
        // translate Y = tile X position PLUS Y position, mulitplied by half tile heights to fit the translation
        ctx.translate(
            (this.position.x - this.position.y) * sizeX / 2,
            (this.position.x + this.position.y) * sizeY / 2
        )
        
        let zOffset = this.position.z * sizeY

        // draw top
        ctx.beginPath()
        ctx.moveTo( 0, -zOffset)              // top center of the tile
        ctx.lineTo( sizeX / 2, sizeY / 2 - zOffset)   // right hand corner
        ctx.lineTo( 0, sizeY - zOffset)                   // bottom corner
        ctx.lineTo( -sizeX / 2, sizeY / 2 - zOffset)  // left corner (*)
        ctx.closePath()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 6
        ctx.stroke()

        // draw left, start at left end corner (*)
        ctx.beginPath()
        ctx.moveTo( -sizeX / 2, sizeY / 2 - zOffset )  // left corner
        ctx.lineTo( 0, sizeY - zOffset)
        ctx.lineTo( 0, sizeY)
        ctx.lineTo( -sizeX / 2, sizeY / 2)
        ctx.closePath()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 6
        ctx.stroke()

        // draw right
        ctx.beginPath()
        ctx.moveTo( sizeX / 2, sizeY / 2 - zOffset )  // left corner
        ctx.lineTo( 0, sizeY - zOffset)
        ctx.lineTo( 0, sizeY)
        ctx.lineTo( sizeX / 2, sizeY / 2)
        ctx.closePath()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 6
        ctx.stroke()

        // restore context state after drawing
        ctx.restore()

        return this
    }

    draw = () => {
        const ctx = this.engineInstance?.getRenderer().getContext()!

        const strokeColor = this.highlightColor 
            ? this.highlightColor.toString() 
            : new Color("#AAAAAA").toString()

        const topColor = this.color.toString()
        const leftColor = this.color.getShade(20)
        const rightColor = this.color.getShade(-20)

        // Size of Cube
        const sizeX = this.dimension.width
        const sizeY = this.dimension.height
        
        // save context state before drawing
        ctx.save()
        
        // move canvas 'origin' 
        // translate X = tile X position MINUS Y position, mulitplied by half tile widths to fit the translation
        // translate Y = tile X position PLUS Y position, mulitplied by half tile heights to fit the translation
        ctx.translate(
            (this.position.x - this.position.y) * sizeX / 2,
            (this.position.x + this.position.y) * sizeY / 2
        )
        
        let zOffset = this.position.z * sizeY

        // draw top
        ctx.beginPath()
        ctx.moveTo( 0, -zOffset)              // top center of the tile
        ctx.lineTo( sizeX / 2, sizeY / 2 - zOffset)   // right hand corner
        ctx.lineTo( 0, sizeY - zOffset)                   // bottom corner
        ctx.lineTo( -sizeX / 2, sizeY / 2 - zOffset)  // left corner (*)
        ctx.closePath()

        ctx.fillStyle = topColor
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fill()

        // draw left, start at left end corner (*)
        ctx.beginPath()
        ctx.moveTo( -sizeX / 2, sizeY / 2 - zOffset )  // left corner
        ctx.lineTo( 0, sizeY - zOffset)
        ctx.lineTo( 0, sizeY)
        ctx.lineTo( -sizeX / 2, sizeY / 2)
        ctx.closePath()

        ctx.fillStyle = leftColor
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fill()

        // draw right
        ctx.beginPath()
        ctx.moveTo( sizeX / 2, sizeY / 2 - zOffset )  // left corner
        ctx.lineTo( 0, sizeY - zOffset)
        ctx.lineTo( 0, sizeY)
        ctx.lineTo( sizeX / 2, sizeY / 2)
        ctx.closePath()

        ctx.fillStyle = rightColor
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fill()

        // restore context state after drawing
        ctx.restore()
    }
}

export default Cube