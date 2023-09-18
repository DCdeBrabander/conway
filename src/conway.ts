import Cell, { CellCoordinate } from "./cell";

export enum States {
    PAUSED,
    RUNNING
}
class Conway {
    private grid: Cell[][] = []

    private canvasElement: HTMLCanvasElement|null
    private canvasContext: CanvasRenderingContext2D|null

    private fps: number
    private resolution: number

    currentState: States = States.PAUSED

    constructor (canvasElement: HTMLCanvasElement, cellSize: number = 10, fps: number = 3) {
        this.canvasElement = canvasElement as HTMLCanvasElement
        this.canvasContext = this.canvasElement!.getContext("2d")

        this.resolution = cellSize
        this.fps = fps

        this.init()
    }

    private init = () => {
        this.setGameState(States.PAUSED)

        window.addEventListener('resize', this.resizeCanvas, false);
        this.resizeCanvas()
        
        // Create all cell instances for every grid coordinate
        this.grid = this.getNewGrid()

        requestAnimationFrame(this.draw);       
    }

    private draw = () => {
        this.clear()

        this.drawCells()

        // Only update if running, this allows us to draw :-) 
        if (this.currentState == States.RUNNING) {
            this.update()
        }
        
        setTimeout(() => {
            requestAnimationFrame(this.draw)
        }, 1000 / this.fps);
    }

    // version 1: Loop through grid checking all cells
    // Mark each cell as dead or alive so we can update state and draw accordingly
    // --
    // TODO version 2: Get areas of living cells and only check around those cells?
    // This should increase loop a lot in many cases
    private update = () => {
        const newGrid = this.getNewGrid()

        this.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
                cell.setAliveNeighbours(this.countAliveNeighboursForCell(cell))
                newGrid[x][y].alive = this.isCellAlive(cell)
            }) 
        })

        this.grid = newGrid
    }

    private clear = () => {
        this.canvasContext!.clearRect(
            0,
            0,
            this.canvasElement!.width,
            this.canvasElement!.height
        )

        this.canvasContext!.fillStyle = "black";
        this.canvasContext!.fillRect(
            0,
            0,
            this.canvasElement!.width, 
            this.canvasElement!.height
        )
    }

    resizeCanvas = () => {
        this.canvasElement!.width = this.roundToNearest(window.innerWidth)
        this.canvasElement!.height = this.roundToNearest(window.innerHeight)
    }

    private getNewGrid = (): Cell[][] => {
        let grid: Cell[][] = [];

        for (let x = 0; x <= this.canvasElement?.width!; x += this.resolution) {
            grid[x] = []
            for (let y = 0; y <= this.canvasElement?.height!; y += this.resolution) {     
                grid[x][y] = new Cell(x, y, false)
            }
        }

        return grid
    }

    private drawCells = () => this.grid.forEach((x: Cell[]) => x.forEach((cell: Cell, y: number) => cell.alive && this.drawCell(cell)))

    private drawCell = (cell: Cell) => {
        this.canvasContext!.fillStyle = "white";
        this.canvasContext!.fillRect(
            cell.x,
            cell.y,
            this.resolution,
            this.resolution
        )
    }

    private getCellAt = (x: number, y: number): Cell => {
        return this.grid[x][y]
    }

    private getOverflowCoordinate = (x: number, y: number): {x: number, y: number} => {
        const overflowedCoordinate = { x, y }

        if (x < 0) {
            overflowedCoordinate.x = this.roundToNearest(this.canvasElement!.width - this.resolution)
        } else if (x > this.canvasElement!.width) {
            overflowedCoordinate.x = 0
        }

        if (y < 0) {
            overflowedCoordinate.y = this.roundToNearest(this.canvasElement!.height - this.resolution)
        } else if (y > this.canvasElement!.height) {
            overflowedCoordinate.y = 0
        }

        return overflowedCoordinate
    }

    setGameState = (state: States) => this.currentState = state

    isCellAlive = (cell: Cell): boolean => {
        let alive = cell.alive
        cell.aliveNeighbours = this.countAliveNeighboursForCell(cell)

        if (!cell.alive) {
            if (cell.aliveNeighbours === 3) {
                alive = true
            }
        } else {
            if (cell.aliveNeighbours === 2 || cell.aliveNeighbours === 3) {
                alive = true
            } else {
                alive = false
            }
        }

        return alive
    }

    toggleCellAtCoordinate = (x: number, y: number) => {
        const roundedX = this.roundToNearest(x)
        const roundedY = this.roundToNearest(y)

        const cell = this.getCellAt(roundedX, roundedY)

        if (!this.getCellAt(roundedX, roundedY)) {
            return
        }

        cell.alive = !cell.alive
    }

    countAliveNeighboursForCell = (cell: Cell): number => {
        let aliveNeigbours = 0
        let res = this.resolution
        const { x, y } = cell

        // infinite
        const cellMatrix: {x: number, y: number}[] = [
            // 'top'
            this.getOverflowCoordinate(x - res, y - res),   // left
            this.getOverflowCoordinate(x,       y - res),   // middle
            this.getOverflowCoordinate(x + res, y - res),   // right
            
            // 'middle'
            this.getOverflowCoordinate(x - res, y),         // left
            // -- current X / Y 
            this.getOverflowCoordinate(x + res, y),         // right
        
            // 'bottom'    
            this.getOverflowCoordinate(x - res, y + res),   // left
            this.getOverflowCoordinate(x,       y + res),   // middle
            this.getOverflowCoordinate(x + res, y + res)    // right
        ]

        for (const coordinate of cellMatrix) {
            if (this.getCellAt(coordinate.x, coordinate.y).alive) {
                aliveNeigbours++
            }
        }

        return aliveNeigbours
    }

    roundToNearest = (number: number, nearest: number = this.resolution): number=> {
        return Math.floor(number / nearest) * nearest
    }
}

export default Conway