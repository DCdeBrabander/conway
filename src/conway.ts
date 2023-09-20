import Cell from "./cell"
import { GetPattern, Patterns } from "./patterns/index"

export enum States {
    PAUSED,
    RUNNING,
    SINGLE_TICK,
}
type coordinate = {
    x: number,
    y: number
}
class Conway {
    // Let's keep things under control
    private MAX_FPS: number = 60
    private MAX_CELL_SIZE: number = 100

    private realFrameTime: number = 0
    private _allowTick: boolean = true

    private theme = {
        grid: "#888",
        cell: {
            alive: "#FFF",
            example: "#AAA",
        },
        background: "#222"
    }
    
    private grid: Cell[][] = []
    private previewCells: Cell[][] = []
 
    private canvasContext: CanvasRenderingContext2D

    public currentState: States = States.PAUSED
    private currentPreviewPattern: Patterns = Patterns.CELL

    private previousCanvasSize: { width: number, height: number } = { width: 0, height: 0 }
    private heightOffset: number = 0
    private resizeTimeout: NodeJS.Timeout

    public get fps(): number {
        return this._fps
    }
    public set fps(value: number) {
        if (value > this.MAX_FPS) {
            console.info("Maximum FPS reached: " + this.MAX_FPS)
            this._fps = this.MAX_FPS
        } else {
            this._fps = value
        }
    }

    public get cellSize(): number {
        return this._cellSize
    }
    public set cellSize(value: number) {
        if (value > this.MAX_CELL_SIZE) {
            console.info("Maximum Cell Size reached: " + this.MAX_CELL_SIZE)
            this._cellSize = this.MAX_CELL_SIZE
        } else {
            this._cellSize = value
        }
    }

    public get allowTick(): boolean {
        return this._allowTick
    }
    public set allowTick(value: boolean) {
        this._allowTick = value
    }

    constructor (
        public canvasElement: HTMLCanvasElement, 
        private _cellSize: number = 10, 
        private _fps: number = 10
    ) {

        this.canvasElement = canvasElement as HTMLCanvasElement
        this.canvasContext = this.canvasElement.getContext("2d")!
        this.resizeTimeout = setTimeout(() => {})
        return this
    }

    init = () => {
        this.setGameState(States.PAUSED)
        this.setCanvasSize(window.innerWidth, window.innerHeight)
        window.addEventListener('resize', this._onResize, false)

        // Create all cell instances for every grid coordinate
        this.grid = this._getNewGrid()
        this.gameLoop()
        return this
    }

    private gameLoop = () => {
        const startFrameTime = performance.timeOrigin + performance.now()

        // Only update if running
        switch (this.currentState) {
            case States.RUNNING: 
                this.run()
                break
            case States.PAUSED:
                this.paused()
                break;
            case States.SINGLE_TICK:
                this.tick()
                break
        }

        this.realFrameTime = (performance.timeOrigin + performance.now() - startFrameTime)  

        setTimeout(() => {
            requestAnimationFrame(this.gameLoop)
        }, 1000 / this.fps)
    }
    
    private tick = () => {
        this.draw()

        if (!this._allowTick) {
            return
        }
        
        this.run()
        this._allowTick = false
    }
    
    private paused = () => {
        this.draw()
    }
   
    private run = () => {
        this.update()
        this.draw()
    }

    private draw = () => {
        this._clear()
        this._drawPreviewCells()
        this._drawLivingCells()
        this._drawGrid()
    }

    // version 1: Loop through whole grid and check all cells
    // Mark each cell as dead or alive so we can update state and draw accordingly
    // TODO: remove if new update() is stable
    private fullUpdate = () => {
        const newGrid = this._getNewGrid()

        this.grid.forEach((column, x) => {
            column.forEach((cell, y) => {
                cell.setAliveNeighbours(this.countAliveNeighboursForCell(cell))
                newGrid[x][y].alive = this.isCellStillAlive(cell)
            }) 
        })

        this.grid = newGrid
    }

    /**
     * version 2: Get areas of living cells and only check around those cells:
     *  1. get grid with of only all alive cells + all cells bordering those
     *  2. use this 'subset grid' to check for dead or alive cells
     *  3. TODO: research partial clearing could be desirable aka clear per cell/area
     */
    private update = () => {
        const relevantCells: Cell[][] = this._findRelevantCellsForUpdate()
        const newGrid = this._getNewGrid()

        relevantCells.forEach((column, x_index) => {
            column.forEach((cell, y_index) => {
                // Update counts in 'current' grid to stay in sync
                this.grid[x_index][y_index].setAliveNeighbours(
                    this.countAliveNeighboursForCell(cell)
                )
                // Update new grid with updated state
                newGrid[x_index][y_index].alive = 
                    this.isCellStillAlive(this.grid[x_index][y_index])
            }) 
        })
        this.grid = newGrid
    }

    private _clear = () => {
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

    private _drawGrid = () => {
        this.canvasContext!.strokeStyle = this.theme.grid
        this.canvasContext.lineWidth = 1

        // Draw for every 'column' (X) from top to bottom
        for (let x = 0; x <= this.canvasElement.width; x += this.cellSize) {
            this.canvasContext.beginPath()
            this.canvasContext.moveTo(x, 0)
            this.canvasContext.lineTo(x, this.canvasElement.height)
            this.canvasContext.stroke()
        }

        // Draw for every 'row' (Y) from left to right
        for (let y = 0; y <= this.canvasElement.height; y += this.cellSize) {
            this.canvasContext.beginPath()
            this.canvasContext.moveTo(0, y)
            this.canvasContext.lineTo(this.canvasElement.width, y)
            this.canvasContext.stroke()
        }
    }

    private _drawPreviewCells = () => {
        this.previewCells.forEach((x: Cell[]) => {
            x.forEach((cell: Cell) => this._drawCell(cell))
        })
    }

    private _drawLivingCells = () => {
        this.grid.forEach((x: Cell[]) => {
            x.forEach((cell: Cell) => this._drawCell(cell))
        })
    }

    private _drawCell = (cell: Cell): void => {
        if (cell.alive) {
            this.canvasContext!.fillStyle = this.theme.cell.alive
        } else if (cell.example) {
            this.canvasContext!.fillStyle = this.theme.cell.example
        } else {
            return
        }

        this.canvasContext!.fillRect(
            cell.x,
            cell.y,
            this.cellSize,
            this.cellSize
        )
    }

    private _onResize = () => {
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {
            this.setCanvasSize(window.innerWidth, window.innerHeight)

            // Calculate difference in grids
            this._resizeGrid()

            console.info("canvas resized: grid updated accordingly")
        }, 100)      
    }

    private _findRelevantCellsForUpdate = (): Cell[][] => {
        const relevantCells: Cell[][] = []

        this.grid.forEach((column, x_index) => {
            column.forEach((cell, y_index) => {
                if (cell.alive) {
                    // All cells around cell
                    for (const coordinate of this.getAllCellNeighbourCoordinates(cell)) {
                        if (!relevantCells[coordinate.x]) {
                            relevantCells[coordinate.x] = []
                        }
                        if (!relevantCells[coordinate.x][coordinate.y]) {
                            relevantCells[coordinate.x][coordinate.y] = this._getCellAt(coordinate.x, coordinate.y)
                        }
                    }

                    // Current cell itself
                    relevantCells[x_index][y_index] = cell                   
                }
            })
        })
        return relevantCells
    }

    private _getNewGrid = (): Cell[][] => {
        let grid: Cell[][] = []

        for (let x = 0; x <= this.canvasElement?.width!; x += this.cellSize) {
            grid[x] = []
            for (let y = 0; y <= this.canvasElement?.height!; y += this.cellSize) {     
                grid[x][y] = new Cell(x, y, false)
            }
        }

        return grid
    }

    private _resizeGrid = () => {
        let grid: Cell[][] = this.grid

        const increasedWidth = this.canvasElement.width > this.previousCanvasSize.width 
        const increasedHeight = this.canvasElement.height > this.previousCanvasSize.height

        // Support increased width/height
        if (increasedWidth || increasedHeight) {
            for (let x = 0; x <= this.canvasElement?.width!; x += this.cellSize) {
                for (let y = 0; y <= this.canvasElement?.height!; y += this.cellSize) {  
                    if (typeof grid[x] === "undefined") {
                        grid[x] = []
                    }   
                    if (typeof grid[x][y] === "undefined") {
                        grid[x][y] = new Cell(x, y, false)
                    }
                }
            }
            console.info("Increased size of grid")
        } else {
            gridLoop: for (let y = this.previousCanvasSize.height; y >= 0; y -= this.cellSize) {  
                for (let x = this.previousCanvasSize.width; x >= 0; x -= this.cellSize) {
                    if (this.canvasElement.height < y) {
                        delete grid[x][y]
                    }else if (this.canvasElement.width < x) {
                        delete grid[x]
                    } else {
                        break gridLoop
                    }
                }
            }
            console.info("Decreased size of grid")
        }
        this.grid = grid
    }

    private _getCellAt = (x: number, y: number): Cell => this.grid[x][y]

    private _overflowPosition = (x: number, y: number): coordinate => {
        const overflowedCoordinate = { x, y }

        const { width, height } = this.canvasElement!

        if (x < 0) {    
            overflowedCoordinate.x = width - this.cellSize
        } else if (x >= width) {
            overflowedCoordinate.x = 0
        }

        if (y < 0) {
            overflowedCoordinate.y = height - this.cellSize
        } else if (y >= height) {
            overflowedCoordinate.y = 0
        }

        return overflowedCoordinate
    }

    getRealFrameTime = () => this.realFrameTime

    getSupportedPatterns = () => Object.keys(Patterns)

    getCurrentPreviewPattern = (): Patterns => this.currentPreviewPattern

    setCurrentPreviewPattern = (pattern: Patterns): this => {
        this.currentPreviewPattern = pattern
        return this
    }

    setHeightOffset = (offset: number): this => {
        this.heightOffset = offset
        return this
    }

    setCanvasSize = (width: number, height: number): this => {
        // Keep track of current size in case of resizing
        // we need this to correctly update grid without resetting it
        this.previousCanvasSize = { 
            width: this.canvasElement!.width,
            height: this.canvasElement!.height
        }

        const fixedWith = this.roundToNearest(width)
        const fixedHeight = this.roundToNearest(height - this.heightOffset)

        this.canvasElement!.style.width = fixedWith + "px"
        this.canvasElement!.style.height = fixedHeight + "px"

        this.canvasElement!.width = fixedWith
        this.canvasElement!.height = fixedHeight

        return this
    }

    setGameState = (state: States): this => { 
        this.currentState = state
        return this
    }

    isCellStillAlive = (cell: Cell): boolean => {
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

    countAliveNeighboursForCell = (cell: Cell): number => {
        let aliveNeigbours = 0
        const cellMatrix: coordinate[] = this.getAllCellNeighbourCoordinates(cell)

        for (const coordinate of cellMatrix) {
            if (this._getCellAt(coordinate.x, coordinate.y).alive) {
                aliveNeigbours++
            }
        }

        return aliveNeigbours
    }

    getAllCellNeighbourCoordinates = (cell: Cell): coordinate[] => {
        const {x, y} = cell
        return [
            // 'top'
            this._overflowPosition(x - this.cellSize, y - this.cellSize),   // left
            this._overflowPosition(x, y - this.cellSize),                   // middle
            this._overflowPosition(x + this.cellSize, y - this.cellSize),   // right
            
            // 'middle'
            this._overflowPosition(x - this.cellSize, y),                   // left
            // -- current X / Y 
            this._overflowPosition(x + this.cellSize, y),                   // right
        
            // 'bottom'    
            this._overflowPosition(x - this.cellSize, y + this.cellSize),   // left
            this._overflowPosition(x, y + this.cellSize),                   // middle
            this._overflowPosition(x + this.cellSize, y + this.cellSize)    // right
        ]
    }

    roundToNearest = (number: number, nearest: number = this.cellSize): number => {
        return Math.floor(number / nearest) * nearest
    }

    showPattern = (patternType: Patterns, currentGridX: number, currentGridY: number, example: boolean = false) => {
        const pattern: number[][] = GetPattern(patternType)
        let grid: Cell[][] = []

        if (example) {
            this.previewCells = this._getNewGrid()
            grid = this.previewCells
        } else {
            grid = this.grid
        }

        // Because aesthetic reasons:
        // We need to calculate offset of pattern so we can center the pattern under mouse.
        // we select first row to check max X-length ASSUMING all rows have equal length.
        const offsetX = Math.floor(pattern[0].length / 2)
        const offsetY = Math.floor(pattern.length / 2)

        // Every row index == Y
        // Every value per row == X
        pattern.forEach((row, previewY) => {
            row.forEach((showCell, previewX) => {
                const x = this.roundToNearest(((previewX - offsetX) * this.cellSize) + currentGridX)
                const y = this.roundToNearest(((previewY - offsetY) * this.cellSize) + currentGridY) 

                if (typeof grid[x][y] === "undefined" || ! grid[x][y]) {
                    return
                }
                
                if (!showCell) {
                    return
                }

                const cell = new Cell(x, y, !example)
                cell.example = example
                grid[x][y] = cell
            })
        })
    }

    showPatternPreview = (patternType: Patterns, currentGridX: number, currentGridY: number) => 
        this.showPattern(patternType, currentGridX, currentGridY, true)

    resetPatternPreview = () => this.previewCells = this._getNewGrid()

    // TODO: currently unused
    toggleCellAtCoordinate = (x: number, y: number): this => {
        const roundedX = this.roundToNearest(x)
        const roundedY = this.roundToNearest(y)
        const cell = this._getCellAt(roundedX, roundedY)

        if (!this._getCellAt(roundedX, roundedY)) {
            return this
        }

        cell.alive = !cell.alive
        return this
    }
}

export default Conway