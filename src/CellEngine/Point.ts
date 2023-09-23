/**
 * 2D Point
 */
export class Point {
    constructor(public x: number, public y: number, public isometric: boolean = false) {
        if (isometric) {
            const isometricPoint = this.toIsometric()
            this.x = isometricPoint.x
            this.y = isometricPoint.y
        }
    }

    // 2D screenspace
    toCartesian = (): Point => {
        return new Point(
            (2 * this.y + this.x) / 2, 
            (2 * this.y - this.x) / 2
        )
    }

    // Standard isometric
    // 2:1 ratio projection
    toIsometric = (): Point => {
        return new Point(
            this.x - this.y,
            (this.x + this.y) / 2
        )
    }
}

export class Point3D {
    constructor(public x: number, public y: number, public z: number) {}
}

export default Point