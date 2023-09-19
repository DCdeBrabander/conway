class Cell {
    x: number = 0
    y: number = 0
    size: number = 0

    example: boolean = false
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

    setAliveNeighbours = (amount: number) => this.aliveNeighbours = amount 
}

export default Cell