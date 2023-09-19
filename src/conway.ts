import Cell from "./cell"
import { GetPattern, Patterns } from "./patterns/index"

export enum States {
    PAUSED,
    RUNNING
}
class Conway {
    private theme = {
        grid: "#AAA",
        cell: {
            alive: "#FFF",
            example: "#AAA",
        },
        background: "#444"
    }
    
    private grid: Cell[][] = []
    private previewCells: Cell[][] = []
 
    private canvasElement: HTMLCanvasElement|null
    private canvasContext: CanvasRenderingContext2D|null

    private fps: number
    private resolution: number

    public currentState: States = States.PAUSED

    private heightOffset = document.querySelector('#info')?.clientHeight ?? 0
    private resizeTimeout: NodeJS.Timeout

    constructor (canvasElement: HTMLCanvasElement, cellSize: number = 10, fps: number = 3) {
        this.canvasElement = canvasElement as HTMLCanvasElement        
        this.canvasContext = this.canvasElement!.getContext("2d")
        
        this.resizeTimeout = setTimeout(() => {})
        this.resolution = cellSize
        this.fps = fps

        this.init()
    }

    private init = () => {
        this.setGameState(States.PAUSED)
        
        this.setCanvasSize(window.innerWidth, window.innerHeight)
        window.addEventListener('resize', this.onResize, false)

        // Create all cell instances for every grid coordinate
        this.grid = this.getNewGrid()

        requestAnimationFrame(this.draw)
    }

    private draw = () => {
        this.clear()


        // Only update if running, this allows us to draw :-) 
        if (this.currentState == States.RUNNING) {
            this.update()
        }

        this.drawPreviewCells()
        this.drawLivingCells()
        this.drawGrid()

        setTimeout(() => {
            requestAnimationFrame(this.draw)
        }, 1000 / this.fps)
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
        this.canvasContext!.fillStyle = this.theme.background

        this.canvasContext!.clearRect(
            0,
            0,
            this.canvasElement!.width,
            this.canvasElement!.height
        )
        this.canvasContext!.fillRect(
            0,
            0,
            this.canvasElement!.width, 
            this.canvasElement!.height
        )
    }

    private onResize = () => {
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {     
            this.setCanvasSize(window.innerWidth, window.innerHeight)            
            this.init()
            console.info("canvas resized and reinitialized")
        }, 100)      
    }

    private getNewGrid = (): Cell[][] => {
        let grid: Cell[][] = []

        for (let x = 0; x <= this.canvasElement?.width!; x += this.resolution) {
            grid[x] = []
            for (let y = 0; y <= this.canvasElement?.height!; y += this.resolution) {     
                grid[x][y] = new Cell(x, y, false)
            }
        }

        return grid
    }

    private drawGrid = () => {
        this.canvasContext!.strokeStyle = this.theme.grid

        this.grid.forEach((x: Cell[]) => {
            x.forEach((cell: Cell, y: number) => {
                this.canvasContext!.strokeRect(
                    cell.x,
                    cell.y,
                    this.resolution, 
                    this.resolution, 
                )
            })
        })
    }

    private drawPreviewCells = () => this.previewCells.forEach((x: Cell[]) => x.forEach((cell: Cell, y: number) => this.drawCell(cell)))

    private drawLivingCells = () => this.grid.forEach((x: Cell[]) => x.forEach((cell: Cell, y: number) => this.drawCell(cell)))

    private drawCell = (cell: Cell): void => {
        if (cell.alive) {
            this.canvasContext!.fillStyle = this.theme.cell.alive
        } else if (cell.example) {
            console.log('drawing example cell')
            this.canvasContext!.fillStyle = this.theme.cell.example
        } else {
            return
        }

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

    private overflowPosition = (x: number, y: number): { x: number, y: number } => {
        const overflowedCoordinate = { x, y }

        const { width, height } = this.canvasElement!

        if (x < 0) {    
            overflowedCoordinate.x = width - this.resolution
        } else if (x >= width) {
            overflowedCoordinate.x = 0
        }

        if (y < 0) {
            overflowedCoordinate.y = height - this.resolution
        } else if (y >= height) {
            overflowedCoordinate.y = 0
        }

        return overflowedCoordinate
    }

    setCanvasSize = (width: number, height: number): void => {
        const fixedWith = this.roundToNearest(width)
        const fixedHeight = this.roundToNearest(height - this.heightOffset)

        this.canvasElement!.style.width = fixedWith + "px"
        this.canvasElement!.style.height = fixedHeight + "px"

        this.canvasElement!.width = fixedWith
        this.canvasElement!.height = fixedHeight
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

    toggleCellAtCoordinate = (x: number, y: number): void => {
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
            this.overflowPosition(x - res, y - res),   // left
            this.overflowPosition(x,       y - res),   // middle
            this.overflowPosition(x + res, y - res),   // right
            
            // 'middle'
            this.overflowPosition(x - res, y),         // left
            // -- current X / Y 
            this.overflowPosition(x + res, y),         // right
        
            // 'bottom'    
            this.overflowPosition(x - res, y + res),   // left
            this.overflowPosition(x,       y + res),   // middle
            this.overflowPosition(x + res, y + res)    // right
        ]

        for (const coordinate of cellMatrix) {
            if (this.getCellAt(coordinate.x, coordinate.y).alive) {
                aliveNeigbours++
            }
        }

        return aliveNeigbours
    }

    roundToNearest = (number: number, nearest: number = this.resolution): number => {
        return Math.floor(number / nearest) * nearest
    }

    // TODO refactor to show(Preview)Pattern(new Cell) (?)
    showPreviewCell = (x: number, y: number) => {
        this.previewCells = this.getNewGrid()
        const cell = this.previewCells[this.roundToNearest(x)][this.roundToNearest(y)]
        cell.example = true
    }

    insertPattern = (patternType: Patterns, gridX: number, gridY: number) => {
        const pattern: boolean[][] = GetPattern(patternType)

        pattern.forEach((row, previewX) => {
            row.forEach((showCell, previewY) => {
                const x = this.roundToNearest((previewX * this.resolution) + gridX)
                const y = this.roundToNearest((previewY * this.resolution) + gridY)

                if (typeof (this.previewCells[x][y] ?? undefined) === "undefined") {
                    console.log('cant update cell at x,y?', x, y)
                    return
                }
                
                if (!showCell) {
                    return
                }

                const cell = new Cell(x, y, true)
                cell.example = true
                this.grid[x][y] = cell
            })
        });
    }

    showPatternPreview = (patternType: Patterns, gridX: number, gridY: number) => {
        this.previewCells = this.getNewGrid()
        const pattern: boolean[][] = GetPattern(patternType)

        pattern.forEach((row, previewX) => {
            row.forEach((showCell, previewY) => {
                const x = this.roundToNearest((previewX * this.resolution) + gridX)
                const y = this.roundToNearest((previewY * this.resolution) + gridY)

                if (typeof (this.previewCells[x][y] ?? undefined) === "undefined") {
                    console.log('cant update cell at x,y?', x, y)
                    return
                }
                
                if (!showCell) {
                    return
                }

                const cell = new Cell(x, y, false)
                cell.example = true
                this.previewCells[x][y] = cell
            })
        });
    }
}

export default Conway