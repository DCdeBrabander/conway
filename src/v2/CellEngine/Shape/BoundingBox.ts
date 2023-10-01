import SomeGame from "../../game";
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
        
        // Quick fix
        const widthOffset = this.dimension.width / (SomeGame.TILE_SIZE * 2)
        const heightOffset = this.dimension.height / SomeGame.TILE_SIZE

        this.minX = Math.floor(this.position.x),
        this.maxX = Math.floor(this.position.x + widthOffset),
        this.minY = Math.floor(this.position.y),
        this.maxY = Math.floor(this.position.y + heightOffset),
        this.minZ = Math.floor(this.position.z),
        this.maxZ = Math.floor(this.position.z + this.dimension.depth)
    }


    intersects = (otherBox: BoundingBox): boolean => {
        console.log('start')
        console.log(this.minX <= otherBox.maxX, this.minX, "<=", otherBox.maxX, "(this:other)")
        console.log(this.maxX >= otherBox.minX, this.maxX, ">=", otherBox.minX,  "(this:other)")
        console.log(this.minY <= otherBox.maxY, this.minY, "<=", otherBox.maxY,  "(this:other)")
        console.log(this.maxY >= otherBox.minY, this.maxY, ">=", otherBox.minY,  "(this:other)") // 7
        console.log(this.minZ <= otherBox.maxZ, this.minZ, "<=", otherBox.maxZ,  "(this:other)") // 2
        console.log(this.maxZ >= otherBox.minZ, this.maxZ, ">=", otherBox.minZ,  "(this:other)") // 2
        console.log('end')

        return this.minX <= otherBox.maxX &&
            this.maxX >= otherBox.minX &&
            this.minY <= otherBox.maxY &&
            this.maxY >= otherBox.minY &&
            this.minZ <= otherBox.maxZ &&
            this.maxZ >= otherBox.minZ
    } 
}

export default BoundingBox