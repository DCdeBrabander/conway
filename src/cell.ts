class Cell {
    constructor (
        public x: number = 0, 
        public y: number = 0, 
        public alive: boolean = true,
        public example: boolean = false,
        public size: number = 0,
        public aliveNeighbours: number = 0
    ) {}

    public setAliveNeighbours = (amount: number) => this.aliveNeighbours = amount 
}

export default Cell