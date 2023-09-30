/**
 * 3D Point
 */
export class Point3D {
    constructor(public x: number, public y: number, public z: number) {}

    drawPriority = () => Math.floor(this.x + this.y + this.z)

    toString = () => `[${Math.floor(this.x)}, ${Math.floor(this.y)}, ${Math.floor(this.z)}]`
}

/**
 * 2D Point
 */
export class Point {
    constructor(public x: number, public y: number) {}

    toString = () => `[${this.x}, ${this.y}]`

    // Standard isometric (2:1 ratio) projection
    // Basically any 'isometric' implementation can be put here 
    // IF toCartesion is opposite
    toIsometric = (): Point => {
        return Point.convertToIsometric(this.x, this.y)
    }

    // 2D screenspace
    toCartesian = (): Point => {
        return Point.convertToCartesian(this.x, this.y)
    }

    static convertToIsometric = (x: number, y: number): Point => {
        return new Point(
            (2 * y + x) / 2, 
            (2 * y - x) / 2
        )
    }

    static convertToCartesian =  (x: number, y: number): Point => {
        return new Point (
            x - y,
            (x + y) / 2
        )
    }
}

export default Point