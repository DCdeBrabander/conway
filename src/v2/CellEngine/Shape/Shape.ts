import { CellEngine, Color, Dimension3d } from "../CellEngine"
import Point, { Point3D } from "../Point"
import BoundingBox from "./BoundingBox"

export type ShapeCollection = Shape[]

export abstract class Shape {
    public className: string
    public engine: CellEngine | null = null

    protected shapeCollection: ShapeCollection = []

    public neighbours: ShapeCollection = []

    public elevation: number = 0
    public position: Point3D = new Point3D(0, 0, 0)
    public dimension: Dimension3d = { width: 0, height: 0, depth: 0 }
    public boundingBox: BoundingBox = new BoundingBox(this.position, this.dimension)

    public canCollide: boolean = false

    public visible: boolean = true
    public drawable: boolean = true
    public updatable: boolean = false
    public drawPriorityOffset: number = 0

    public highlightColor: Color | null = null

    constructor(className?: string) {
        this.className = className ?? this.constructor.name
    }

    getRenderer = () => this.engine?.getRenderer()

    toString = (): string => this.className

    getFullPositionString = (): string => this.getNormalizedByElevationPoint() + "_" + this.elevation

    // offset position x/y with elevation
    getNormalizedByElevationPoint = () => new Point3D(
        this.position.x + (this.elevation / 2),
        this.position.y + (this.elevation / 2),
        this.position.z
    )

    outline = (color?: Color): this => this

    setNeighbours = (neighbours: ShapeCollection) => this.neighbours = neighbours
    addNeighbours = (neighbour: Shape) => this.neighbours.push(neighbour)
    getCurrentNeighbours = () => this.neighbours

    updateDimension = (newDimension: Dimension3d) => {
        this.dimension = newDimension

        // New dimension means changes to max size of bounding box
        this.boundingBox = new BoundingBox(this.position, newDimension)
        
        this.updatable = true
        return this
    }

    updatePosition = (newPosition: Point3D): this => {
        const {x, y, z} = newPosition

        this.position.x = x
        this.position.y = y
        this.position.z = z
        
        // Because position changes, let's update bounding box of shape too
        this.boundingBox = new BoundingBox(newPosition, this.dimension)

        this.updatable = true
        return this
    }

    isCollidingWithShape = (otherShape: Shape): boolean => {
        return CellEngine.intersect(this.boundingBox, otherShape.boundingBox)
    }

    isCollidingWithShapeFromPoint = (point:Point3D, otherShape: Shape): boolean => {
        return CellEngine.intersect(new BoundingBox(point, this.dimension), otherShape.boundingBox)
    }

    getPosition = (): Point3D => this.position

    getDrawPriority = ():number => this.position.drawPriority() + this.drawPriorityOffset

    getShapeCollection = (): ShapeCollection => this.shapeCollection

    isCollection = ():boolean => false

    getAssetIndex = (): string => this.position.drawPriority() + "_" + this.className

    draw = () => {}

    update = () => {}

    needDraw = (): boolean => this.drawable

    needUpdate = (): boolean => this.updatable

    show = (): this => {
        this.visible = true
        return this
    }

    hide = (): this => {
        this.visible = false
        return this
    }

    bind = (engine: CellEngine) => {
        this.engine = engine
    }
}

export type ShapeStyle = {
    strokeStyle?: string
    fillStyle?: string
    lineWidth?: number
}

export default Shape