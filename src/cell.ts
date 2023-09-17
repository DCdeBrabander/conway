class Cell {
    x: number = 0
    y: number = 0
    size: number = 0

    constructor (x: number, y: number, size: number = 10) {
        this.x = x
        this.y = y
        this.size = size
    }
}

export default Cell