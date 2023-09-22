import { Color } from "./Color"
export { CellMath } from "./Math"

export type Dimension = {
    width: number,
    height: number
}

export type Coordinate = {
    x: number,
    y: number
}

/**
 * our underlying draw and (future) p2p/web traffic logic
 * goal: ConwayGame should be main bootstrap file and interface between human/UI and logic
 */
export class CellEngine {
    private context2d: CanvasRenderingContext2D

    constructor (private canvas: HTMLCanvasElement) {
        this.context2d = canvas.getContext("2d")!
    }

    // Math = () => this.MathModule

    getContext = () => this.context2d

    /* CANVAS */
    clearCanvas = () => this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height)
    getCanvas = () => this.canvas
    getCanvasSize = (): Dimension => ({ width: this.canvas.width, height: this.canvas.height })

    setCanvasBackground = (color: Color) => {
        this.setFillColor(color)
        this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    setCanvasSize = (width: number, height: number): this => {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width
        this.canvas.height = height
        return this
    }

    /* SET COLOR */
    setStrokeColor = (color: Color | string) => this.context2d.strokeStyle = color.toString()
    setFillColor = (color: Color | string) => this.context2d.fillStyle = color.toString()
    
    /* DRAW SHAPES */
    drawLine = (startX:number, startY: number, endX:number, endY:number) => {
        this.context2d.lineWidth = 1
        this.context2d.beginPath()
        this.context2d.moveTo(startX, startY)
        this.context2d.lineTo(endX, endY)
        this.context2d.stroke()
    }
    
    drawRectangle = (x: number, y: number, width: number, height: number) => {
        this.context2d.fillRect(x, y, width, height)
    }
    
    // Alias to drawRectangle
    drawSquare = (x: number, y: number, size: number) =>
        this.drawRectangle(x, y, size, size)

}