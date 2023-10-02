import { Color, Dimension } from "./CellEngine"
import Point, { Point3D } from "./Point"
import Shape from "./Shape/Shape"

export const MAX_FPS: number = 60

// TODO Rename DrawMode to ProjectionType (or something)
export enum DrawMode {
    ISOMETRIC = "isometric",
    DEFAULT = "default"
}

class Renderer {
    public defaultDrawMode: DrawMode = DrawMode.DEFAULT

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
        // console.info('draw')
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

        // Just a list of the assets for quick loop and draw
        this.drawableAssets[mode].push(shape)

        // indexed list of shapes to search by key
        if ( ! this.indexedAssets[mode].get(shape.getFullPositionString())) {
            this.indexedAssets[mode].set(
                shape.getFullPositionString(),
                shape
            )
        }
      
    }

    findIndexedAsset = (key: string, drawMode: DrawMode): Shape | null => {
        return this.indexedAssets[drawMode].get(key) ?? null
    }

    getIndexedAssets = (drawMode: DrawMode) => this.indexedAssets[drawMode]

    getDrawables = (mode: DrawMode) => this.drawableAssets[mode] ?? []

    sortShapesByDrawpriority = (inputA: Shape, inputB: Shape) => {
        if (inputA.getDrawPriority() == inputB.getDrawPriority()) {
            return -1 // 0
        }
        return inputA.getDrawPriority() > inputB.getDrawPriority() ? 1 : -1 
    }
     // 3d (x,y,z,)
    // Default max results = 8 because of 8 'tiles' around center tile
    getAreaOfShapes = (shape: Shape, areaPointOffset: number = 2, maxResults = 30) => {
        const results = []
        const area = {
            minX: shape.position.x - 1,
            maxX: shape.position.x + 2,
            
            minY: shape.position.y - 1,
            maxY: shape.position.y + 2,

            minZ: shape.position.z,
            maxZ: shape.position.z,
            // maxZ: shape.position.z
        }

        // console.log(shape.position.z)

        // loop through every Z, for every Y, for every X
        areaLoop: for (let x = area.minX; x <= area.maxX; x++) {
            for (let y = area.minY; y <= area.maxY; y++) {
                for (let z = area.minZ; z <= area.maxZ; z++) {
                    // find shape by position, TODO we can do more efficient
                    const otherShape = this.findIndexedAsset(
                        new Point3D(x, y, shape.position.z).toString(),
                        DrawMode.ISOMETRIC
                    )

                    if (otherShape && shape.className !== otherShape?.className) {
                        otherShape.highlightColor = new Color("#00FF00")
                        results.push(otherShape)
                    } 

                    if (results.length >= 20){
                        break areaLoop
                    }
                }
            }
        }

        return results
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