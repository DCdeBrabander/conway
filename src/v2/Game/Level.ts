import { Color } from "../CellEngine/CellEngine"
import { Point3D } from "../CellEngine/Point"
import Cube from "../CellEngine/Shape/Isometric/Cube"
import Shape from "../CellEngine/Shape/Shape"
import level_1 from "./Map/level_1"

// basically Isometric Grid containing/wrapping other assets
class Level extends Shape {
    constructor(
        private level: number,
        private tileSize: number
    ){
        super("Level")

        // NOTE assetIdentifier === Z right now
        // TODO abstract to some asset store and get Z from there! 
        if (this.level == 1) {
            level_1.forEach((row, index_y) => {      
                row.forEach((assetIdentifier, index_x) => {
                    // Try to order all 'sub' shapes within this shape
                    // and allow callee to draw then
                    const LevelCube = new Cube(
                        new Point3D(index_x, index_y, Number(assetIdentifier)),
                        this.tileSize,
                        this.getAssetColor(assetIdentifier),
                    )

                    LevelCube.elevation = 1
                    LevelCube.className = "Level_" + LevelCube.className
                    this.shapeCollection.push( LevelCube )
                })
            })
        }
    }

    isCollection = (): boolean => true

    getShapeCollection = () => this.shapeCollection

    getAssetColor = (input: string) => {
        switch(input) {
            case "1":
                return new Color("#222222")
            case "2":
                return new Color("#444444")
            case "3":
                return new Color("#666666")
            case "4":
                return new Color("#888888")
            default:
                return new Color("#FFFFFF")
        }
    }
}

export default Level