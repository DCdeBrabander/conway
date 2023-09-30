import { Color } from "../CellEngine"
import { Shape } from "./Shape"

class Rectangle extends Shape {
    private fillColor: Color = new Color("#FFFFFF")
    private strokeColor: Color = new Color("#000000")

    draw = () => {
        const ctx = this.engineInstance?.getContext()!

        ctx.beginPath()
      
        ctx.rect(
            this.position.x,
            this.position.y, 
            this.dimension.width,
            this.dimension.height
        )

        if (this.fillColor) {
            ctx.fillStyle = this.fillColor.toString()
            ctx.fill()
        }

        if (this.strokeColor) {
            ctx.lineWidth = 2
            ctx.strokeStyle = this.strokeColor.toString()
            ctx.stroke()
        }
    }

    setFillColor = (color: Color): this => { 
        this.fillColor = color
        return this
    }

    setStrokeColor = (color: Color): this => { 
        this.strokeColor = color
        return this
    }
}

export default Rectangle