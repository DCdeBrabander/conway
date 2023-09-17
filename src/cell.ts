export type CellCoordinate = `[${number}:${number}]`
class Cell {
    x: number = 0
    y: number = 0
    size: number = 0

    updated: boolean = false
    alive: boolean = true

    constructor (x: number, y: number, size: number = 10) {
        this.x = x
        this.y = y
        this.size = size
    }

    getCoordinateString = (): CellCoordinate => {
        return `[${this.x}:${this.y}]`
    }
}

export default Cell