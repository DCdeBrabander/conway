import Point from "./CellEngine/Point"

class Cell {
    constructor (
        public point: Point = new Point(0, 0),
        public size: number = 0,
        public alive: boolean = true,
        public example: boolean = false,
        public aliveNeighbours: number = 0
    ) {}

    public setAliveNeighbours = (amount: number) => this.aliveNeighbours = amount 
}

export default Cell