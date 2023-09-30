import { Color, Dimension, DrawMode } from "./CellEngine"
import Shape from "./Shape/Shape"

class Renderer {

    // private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    // Simple array of drawable assets ordered by drawOrderIndex (positive int)
    private drawableAssets: Record<DrawMode, Shape[]> = {
        [DrawMode.DEFAULT]: [],
        [DrawMode.ISOMETRIC]: []
    }

    private indexedAssets: Record<DrawMode, Map<string, Shape>> = {
        [DrawMode.DEFAULT]: new Map(),
        [DrawMode.ISOMETRIC]: new Map()
    }

    constructor(protected canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = this.canvas.getContext("2d")!
    }

    /* THE ACTUAL DRAWING OF GAME WORLD */
    draw = () => {
        this.clearCanvas()
        
        this.context.save()
        this.drawShapes(this.drawableAssets[DrawMode.DEFAULT])
        this.context.restore()

        this.context.save()
        this.context.translate(this.canvas.width / 2, 200)
        this.drawShapes(this.drawableAssets[DrawMode.ISOMETRIC])
        this.context.restore()
    }

    drawShapes = (shapeMap: Shape[]) => {
        for (const shape of shapeMap) {
            if (shape.visible) {
                // console.log(shape.className, shape.engineInstance)
                shape.draw()
                shape.highlightColor = null
            }
        }
    }

    /* DRAW CODE  */
    // Support Shape's that are collections of other shapes (level of cubes, grid of tiles, ...)
    addDrawable = (shape: Shape, mode: DrawMode = DrawMode.DEFAULT ) => {
        if (shape.isCollection()) {
            shape.getShapeCollection().forEach((shape) => this.addDrawable(shape, mode))
            return
        }
        
        this.drawableAssets[mode].push(shape)
        this.indexedAssets[mode].set(
            shape.toString(),
            shape
        )
    }

    getIndexedAssets = (drawMode: DrawMode) => this.indexedAssets[drawMode]

    // updateIndexedDrawables = (mode: DrawMode) => {
    //    this.indexedAssets[mode] = this.getDrawables(DrawMode.DEFAULT).sort(this.sortShapesByDrawpriority)
    // }

    getDrawables = (mode: DrawMode) => this.drawableAssets[mode] ?? []

    sortShapesByDrawpriority = (inputA: Shape, inputB: Shape) => {
        if (inputA.getDrawPriority() == inputB.getDrawPriority()) {
            return -1 // 0
        }
        return inputA.getDrawPriority() > inputB.getDrawPriority() ? 1 : -1 
    }

    /* CANVAS */
    clearCanvas = () => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    getCanvas = (): HTMLCanvasElement => this.canvas
    setCanvas = (canvas: HTMLCanvasElement) => this.canvas = canvas
    
    getCanvasSize = (): Dimension => ({ width: this.canvas.width, height: this.canvas.height })
    setCanvasSize = (width: number, height: number): this => {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width
        this.canvas.height = height
        return this
    }

    setCanvasBackground = (color: Color) => {
        this.context.fillStyle = color.toString()
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
   
    getContext = () => this.context
}

export default Renderer