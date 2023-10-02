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

        // console.log(this.dimension.depth)

        this.minX = Math.floor(this.position.x),
        this.maxX = Math.floor(this.position.x + widthOffset),
        this.minY = Math.floor(this.position.y),
        this.maxY = Math.floor(this.position.y + heightOffset),
        this.minZ = Math.floor(this.position.z),
        this.maxZ = Math.floor(this.position.z)
    }

    intersects = (otherBox: BoundingBox): boolean => {
        // works for top
        // this.minX + 2 <= otherBox.maxX &&
        //     this.maxX + 2 >= otherBox.minX &&
        //     this.minY + 2 <= otherBox.maxY &&
        //     this.maxY + 2 >= otherBox.minY &&
        //     this.minZ <= otherBox.maxZ &&
        //     this.maxZ >= otherBox.minZ
        // && console.log("COLLISION A")



        // this.minX + 1 <= otherBox.maxX &&
        //     this.maxX >= otherBox.minX &&
        //     this.minY + 1 <= otherBox.maxY &&
        //     this.maxY >= otherBox.minY &&
        //     this.minZ <= otherBox.maxZ &&
        //     this.maxZ >= otherBox.minZ
        // && console.log("COLLISION A")

        // console.log(this.minX + 2, this.minY + 2, this.minZ)
        // console.log(otherBox.minX, otherBox.minY, otherBox.minZ)        
        return false
    } 
}

export default BoundingBox