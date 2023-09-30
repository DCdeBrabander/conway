import { Dimension3d } from "../CellEngine";
import { Point3D } from "../Point";

export class BoundingBox {
    public minX: number
    public maxX: number
    public minY: number
    public maxY: number
    public minZ: number
    public maxZ: number

    constructor (public position: Point3D, public dimension: Dimension3d){
        this.minX = Math.floor(this.position.x),
        this.maxX = Math.floor(this.position.x + this.dimension.width),
        this.minY = Math.floor(this.position.y),
        this.maxY = Math.floor(this.position.y + this.dimension.height),
        this.minZ = Math.floor(this.position.z),
        this.maxZ = Math.floor(this.position.z + this.dimension.depth)
    }
}

export default BoundingBox