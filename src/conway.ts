import { CellConfig, CellEngine, CellMath, Coordinate, Dimension, MAX_FPS, States } from "./CellEngine/CellEngine"
import { Color } from "./CellEngine/Color"
import { GetPattern, Patterns } from "./patterns/index"
import Cell from "./cell"

const MAX_CELL_SIZE: number = 100 // Let's keep things under control

type ConwayConfig = CellConfig & {
    cellSize?: number
}

class Conway extends CellEngine {
    private theme = {
        grid: new Color("#888"),
        cell: {
            alive: new Color("#FFF"),
            example: new Color("#AAA"),
        },
        background: new Color("#222")
    }
    
    private grid: Cell[][] = []
    private previewCells: Cell[][] = []
 
    private currentPreviewPattern: Patterns = Patterns.CELL

    private previousCanvasSize: Dimension = { width: 0, height: 0 }
    private heightOffset: number = 0
    private resizeTimeout: NodeJS.Timeout = setTimeout(() => {})

    private _cellSize:number = 10
    public get cellSize(): number {
        return this._cellSize
    }
    public set cellSize(value: number) {
        if (value > MAX_CELL_SIZE) {
            console.info("Maximum Cell Size reached: " + MAX_CELL_SIZE)
            this._cellSize = MAX_CELL_SIZE
        } else {
            this._cellSize = value
        }
    }

    constructor (
        canvasElement: HTMLCanvasElement, 
        private instanceConfig: ConwayConfig = { cellSize: MAX_CELL_SIZE, fpsLimit: MAX_FPS }) {
        super(canvasElement)
        this.setup()
        return this
    }

    /**
     * Tell CellEngine/Parent what we want to run on which game-state 
     * TODO: introduce custom game-states
     */
    public setup = () => {
        CellMath.setNearestRounding(this.instanceConfig.cellSize ?? MAX_CELL_SIZE)
        
        this.runOnState(States.RUNNING, () => {
            this._updateCellsInGrid()
            this.draw()
        })

        this.runOnState(States.PAUSED, () => {
            this.draw()
        })

        this.runOnState(States.SINGLE_TICK, () => {
            this.onRunning()
        })
    }

    public initialize = (config: ConwayConfig = {}): this => {
        this.setState(States.PAUSED)

        this.cellSize = config.cellSize ?? this.instanceConfig.cellSize ?? MAX_CELL_SIZE
        this.fps = config.fpsLimit ?? this.instanceConfig.fpsLimit ?? MAX_FPS

        this._setCanvasSize(window.innerWidth, window.innerHeight)

        this.grid = this._getNewGrid()

        this.run()

        return this
    }
    
    /**
     * Wraps all draw logic for the game
     */
    public draw = () => {
        this.clearCanvas()
        this.setCanvasBackground(this.theme.background)
        this._drawPreviewCells()
        this._drawLivingCells()
        this._drawGrid()
    }

    public onResize = () => {
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {
            this._setCanvasSize(window.innerWidth, window.innerHeight)

            // Calculate difference in grids
            this._resizeGrid()

            console.info("canvas resized: grid updated accordingly")
        }, 100)      
    }

    public insertPattern = (
        patternType: Patterns,
        currentGridX: number,
        currentGridY: number,
        example: boolean = false
    ): void => {
        if (!example && patternType == Patterns.CELL) {
            this.toggleCellAtCoordinate(currentGridX, currentGridY)
            return
        }
        this._insertPattern(patternType, currentGridX, currentGridY, example)
    }

    public showPatternPreview = (patternType: Patterns, currentGridX: number, currentGridY: number) => 
        this.insertPattern(patternType, currentGridX, currentGridY, true)

    public resetPatternPreview = () => this.previewCells = this._getNewGrid()

    public toggleCellAtCoordinate = (x: number, y: number): this => {
        const roundedX = CellMath.roundToNearest(x)
        const roundedY = CellMath.roundToNearest(y)
        const cell = this._getCellAt(roundedX, roundedY)

        if (!this._getCellAt(roundedX, roundedY)) {
            return this
        }

        cell.alive = !cell.alive
        return this
    }

    public getSupportedPatterns = () => Object.keys(Patterns)

    public getCurrentPreviewPattern = (): Patterns => this.currentPreviewPattern

    public setCurrentPreviewPattern = (pattern: Patterns): this => {
        this.currentPreviewPattern = pattern
        return this
    }

    public setHeightOffset = (offset: number): this => {
        this.heightOffset = offset
        return this
    }

    private _setCanvasSize = (newWidth: number, newHeight: number): this => {
        // Keep track of current size in case of resizing
        // we need this to correctly update grid without resetting it
        const { width, height } = this.getCanvasSize()
        this.previousCanvasSize = { width, height }

        const fixedWidth = CellMath.roundToNearest(newWidth)
        const fixedHeight = CellMath.roundToNearest(newHeight - this.heightOffset)
        
        this.setCanvasSize(fixedWidth, fixedHeight)
        return this
    }

    private _updateCellsInGrid = () => {
        const relevantCells: Cell[][] = this._findRelevantCellsForUpdate()
        const newGrid = this._getNewGrid()

        relevantCells.forEach((column, x_index) => {
            column.forEach((cell, y_index) => {
                // Update counts in 'current' grid to stay in sync
                this.grid[x_index][y_index].setAliveNeighbours(
                    this._countAliveNeighboursForCell(cell)
                )
                // Update new grid with updated state
                newGrid[x_index][y_index].alive = 
                    this._isCellStillAlive(this.grid[x_index][y_index])
            }) 
        })
        this.grid = newGrid
    }

    private _drawGrid = () => {
        this.setStrokeColor(this.theme.grid )
        const canvasRef = this.getCanvasSize()

        // Draw for every 'column' (X) from top to bottom
        for (let x = 0; x <= canvasRef.width; x += this.cellSize) {
            this.drawLine(x, 0, x, canvasRef.height)
        }

        // Draw for every 'row' (Y) from left to right
        for (let y = 0; y <= canvasRef.height; y += this.cellSize) {
            this.drawLine(0, y, canvasRef.width, y)
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
        const { alive: aliveColor, example: exampleColor } = this.theme.cell
        if (cell.alive) {
            this.setFillColor(aliveColor)
        } else if (cell.example) {
            this.setFillColor(exampleColor)
        } else {
            return
        }
        this.drawSquare(cell.x, cell.y, this.cellSize)
    }

    private _findRelevantCellsForUpdate = (): Cell[][] => {
        const relevantCells: Cell[][] = []
        const { width, height } = this.getCanvasSize()

        // Instead of looping through grid we just iterate 'manually' in grid steps
        // This should result in exact same behaviour as looping through (this.)grid
        // but more performant
        for (let x = 0; x <= width; x += this.cellSize) {
            for (let y = 0; y <= height; y += this.cellSize) {
                if (!this.grid[x][y].alive) {
                    continue
                }

                // All cells around cell
                for (const coordinate of this._getAllCellNeighbourCoordinates(this.grid[x][y])) {
                    if (!relevantCells[coordinate.x]) {
                        relevantCells[coordinate.x] = []
                    }
                    if (!relevantCells[coordinate.x][coordinate.y]) {
                        relevantCells[coordinate.x][coordinate.y] = 
                            this._getCellAt(coordinate.x, coordinate.y)
                    }
                }

                // Current cell itself
                relevantCells[x][y] = this.grid[x][y]                   
            }
        }

        return relevantCells
    }

    private _getNewGrid = (): Cell[][] => {
        let grid: Cell[][] = []
        const { width: canvasWidth, height: canvasHeight } = this.getCanvasSize()

        for (let x = 0; x <= canvasWidth; x += this.cellSize) {
            grid[x] = []
            for (let y = 0; y <= canvasHeight; y += this.cellSize) {     
                grid[x][y] = new Cell(x, y, false)
            }
        }

        return grid
    }

    private _resizeGrid = () => {
        let grid: Cell[][] = this.grid

        const { width: canvasWidth, height: canvasHeight } = this.getCanvasSize()

        const increasedWidth = canvasWidth > this.previousCanvasSize.width 
        const increasedHeight = canvasHeight > this.previousCanvasSize.height

        // Support increased width/height
        if (increasedWidth || increasedHeight) {
            for (let x = 0; x <= canvasWidth!; x += this.cellSize) {
                if (typeof grid[x] === "undefined") {
                    grid[x] = []
                } 
                for (let y = 0; y <= canvasHeight!; y += this.cellSize) {    
                    if (typeof grid[x][y] === "undefined") {
                        grid[x][y] = new Cell(x, y, false)
                    }
                }
            }
            console.info("Increased size of grid")
        } else {
            gridLoop: for (let y = this.previousCanvasSize.height; y >= 0; y -= this.cellSize) {  
                for (let x = this.previousCanvasSize.width; x >= 0; x -= this.cellSize) {
                    if (canvasHeight < y) {
                        delete grid[x][y]
                    }else if (canvasWidth < x) {
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

    private _overflowPosition = (x: number, y: number): Coordinate => {
        const overflowedCoordinate = { x, y }

        const { width, height } = this.getCanvasSize()

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

    private _isCellStillAlive = (cell: Cell): boolean => {
        let alive = cell.alive
        cell.aliveNeighbours = this._countAliveNeighboursForCell(cell)

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

    private _countAliveNeighboursForCell = (cell: Cell): number => {
        let aliveNeigbours = 0
        const cellMatrix: Coordinate[] = this._getAllCellNeighbourCoordinates(cell)

        for (const coordinate of cellMatrix) {
            if (this._getCellAt(coordinate.x, coordinate.y).alive) {
                aliveNeigbours++
            }
        }

        return aliveNeigbours
    }

    private _getAllCellNeighbourCoordinates = (cell: Cell): Coordinate[] => {
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

    private _insertPattern = (
        patternType: Patterns,
        currentGridX: number,
        currentGridY: number,
        example: boolean = false
    ): void=> {
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
                const x = CellMath.roundToNearest(((previewX - offsetX) * this.cellSize) + currentGridX)
                const y = CellMath.roundToNearest(((previewY - offsetY) * this.cellSize) + currentGridY) 

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
}

export default Conway