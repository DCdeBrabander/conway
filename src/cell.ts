export type CellCoordinate = `[${number}:${number}]`
class Cell {
    x: number = 0
    y: number = 0
    size: number = 0

    updated: boolean = false
    alive: boolean = true
    aliveNeighbours: number = 0

    constructor (
        x: number, 
        y: number, 
        alive: boolean
    ) {
        this.x = x
        this.y = y
        this.alive = alive
    }

    getCoordinateString = (): CellCoordinate => `[${this.x}:${this.y}]`

    setAliveNeighbours = (amount: number) => this.aliveNeighbours = amount 
}

export default Cell