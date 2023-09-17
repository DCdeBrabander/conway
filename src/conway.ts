import Cell, { CellCoordinate } from "./cell";

export enum States {
    PAUSED,
    RUNNING
}
class Conway {
    // String = coordinate hash for faster lookup, better readability and future expansion
    // caveat: possibly big memory footprint when going all out
    cells: Map<string, Cell> = new Map()

    canvasElement: HTMLCanvasElement|null
    canvasContext: CanvasRenderingContext2D|null

    canvasWidth: number = 0
    canvasHeight: number = 0

    fps: number = 1
    resolution: number = 50

    currentState: States = States.PAUSED

    constructor (canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement as HTMLCanvasElement
        this.canvasContext = this.canvasElement!.getContext("2d")

        this.init()
    }

    init = () => {
        this.canvasWidth = this.canvasElement?.width ?? 0
        this.canvasHeight = this.canvasElement?.height ?? 0
        
        console.info(this.canvasWidth + "x" + this.canvasHeight)

        // Always create cell instance for each grid coordinate
        for (let x = 0; x <= this.canvasWidth; x += this.resolution) {
            for (let y = 0; y <= this.canvasHeight; y += this.resolution) {
                if (!this.hasCellAtXY(x, y)) {
                    this.addCellAtCoordinate(x, y, false)
                }
            }
        }

        requestAnimationFrame(this.draw);       
    }

    draw = () => {
        this.clear()

        this.cells.forEach((cell: Cell) => {
            if (cell.alive) {
                this.drawCell(cell)
            }
            // else {
            //     this.cells.delete(cell.getCoordinateString())
            // }
        })
    
        // TODO version 2: Get areas of living cells and only check around those cells?
        // This should increase loop a lot in many cases
    
        setTimeout(() => {
            // Only update if running, this allows us to draw :-) 
            if (this.currentState == States.RUNNING) {
                this.update()
            }

            requestAnimationFrame(this.draw)
        }, 1000 / this.fps);
    }

    // version 1: Loop through grid checking all cells
    // Mark each cell as dead or alive so we can update state and draw accordingly
    update = () => {
        for (let x = 0; x < this.canvasWidth; x += this.resolution) {
            for (let y = 0; y < this.canvasHeight; y += this.resolution) {
                const aliveNeigbours = this.getAliveNeighboursForCoordinate(x, y)
                const cell = this.getCellByCoordinateKey(this.createCellCoordinate(x, y))!

                if (aliveNeigbours > 1) {
                    console.log(x, y, aliveNeigbours, cell)
                    // debugger
                }

                // Any live cell with two or three live neighbours survives.
                if (cell.alive) {
                    if (aliveNeigbours == 2 || aliveNeigbours == 3) {
                        continue
                    }
                } else {
                    if (aliveNeigbours == 3) {
                        cell.alive = true
                        continue 
                    }
                }

                // All other cells die or stay dead
                cell.alive = false
            }
        }
    }

    clear = () => {
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

    drawCell = (cell: Cell) => {
        this.canvasContext!.fillStyle = "white";
        this.canvasContext!.fillRect(
            cell.x,
            cell.y,
            cell.size,
            cell.size
        );
    }

    addCellAtCoordinate = (x: number, y: number, alive: boolean = true): Cell => {
        // make sure x, y fits on our grid
        const roundedX = this.roundToNearest(x)
        const roundedY = this.roundToNearest(y)
        const coordinate = this.createCellCoordinate(roundedX, roundedY)

        if (alive) {
            console.info("Bring cell to life at ", coordinate)
        }

        if (this.hasCellAtCoordinateKey(coordinate)) {
            const cell = this.getCellByCoordinateKey(coordinate)!
            cell.alive = true
            return cell
        }

        const cell = new Cell(roundedX, roundedY, this.resolution)
        cell.alive = alive

        this.cells.set(
            coordinate, 
            cell
        )

        return cell
    }

    setGameState = (state: States) => {
        console.info("Updating game state to: ", state)
        this.currentState = state
    }

    private getAliveNeighboursForCell = (cell: Cell): number => {
        return this.getAliveNeighboursForCoordinate(cell.x, cell.y)
    }
    
    private getAliveNeighboursForCoordinate = (x: number, y: number): number => {
        /**
         * 1,  2,  3
         * 4, X/Y, 5
         * 6.  7,  8
         */

        let aliveNeigbours = 0
        let res = this.resolution

        // infinite
        const cellMatrix = [
            // 'top'
            [
                { ...this.getOverflowCoordinate(x - res, y - res) },    // left
                { ...this.getOverflowCoordinate(x, y - res) },          // middle
                { ...this.getOverflowCoordinate(x + res, y - res) }     // right
            ],
            // 'middle'
            [
                { ...this.getOverflowCoordinate(x - res, y) },          // left
                // current cell
                { ...this.getOverflowCoordinate(x + res, y) }           // right
            ],
            // 'bottom'
            [
                { ...this.getOverflowCoordinate(x - res, y + res) },    // left
                { ...this.getOverflowCoordinate(x, y + res) },          // middle
                { ...this.getOverflowCoordinate(x + res, y + res) }     // right
            ]
        ]
        
        cellMatrix.forEach((row) => {
            row.forEach((cell) => {
                aliveNeigbours = this.getCellByXY(cell.x, cell.y).alive 
                    ? aliveNeigbours + 1 
                    : aliveNeigbours
            })
        })

        return aliveNeigbours
    }

    private hasCellAtXY = (x: number, y: number): boolean => {
        const coordinate = this.createCellCoordinate(x, y)
        return this.hasCellAtCoordinateKey(coordinate)
    }
    
    private getCellByXY = (x: number, y: number): Cell => {
        return this.getCellByCoordinateKey(this.createCellCoordinate(x, y))!
    }

    private hasCellAtCoordinateKey = (coordinate: CellCoordinate): boolean => {
        return this.cells.has(coordinate)
    }

    private getCellByCoordinateKey = (coordinate: CellCoordinate): Cell => {
        if (!this.cells.has(coordinate)) {
            throw new Error(`Major issue: cell not found but should be initialized... (${coordinate})`)
        }

        return this.cells.get(coordinate)!

    }

    private createCellCoordinate = (x: number, y: number): CellCoordinate => {
        if (x < 0 || y < 0) {
            throw new Error (`createCellCoordinate: Invalid coordinates given! (${x}:${y})`)
        }
        return `[${x}:${y}]`
    }

    private roundToNearest = (number: number, nearest: number = this.resolution): number=> {
        return Math.floor(number / nearest) * nearest
    }

    private getOverflowCoordinate = (x: number, y: number) => {
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
}

export default Conway