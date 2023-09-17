import Cell, { CellCoordinate } from "./cell";

class Conway {
    // String = coordinate hash for faster lookup, better readability and future expansion
    // caveat: possibly big memory footprint when going all out
    cells: Map<string, Cell> = new Map()

    canvasElement: HTMLCanvasElement|null
    canvasContext: CanvasRenderingContext2D|null

    fps: number = 2
    resolution: number = 10

    constructor (canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement as HTMLCanvasElement
        this.canvasContext = this.canvasElement!.getContext("2d")

        // load cells / game
        // ...

        requestAnimationFrame(this.draw);       
    }

    draw = () => {
        this.clear()
        
        console.info("drawing...")
        this.cells.forEach(this.drawCell)

        setTimeout(() => {
            requestAnimationFrame(this.draw)
        }, 1000 / this.fps);
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

    addCellAtCoordinate = (x: number, y: number): boolean => {
        // make sure x, y fits on our grid
        const roundedX = this.roundToNearest(x)
        const roundedY = this.roundToNearest(y)
        const coordinate = this.createCellCoordinate(roundedX, roundedY)

        if (this.hasCellAtCoordinate(coordinate)) {
            console.info('lets not create cells on top of eachother (yet?)')
            return false
        }

        this.cells.set(
            coordinate, 
            new Cell(roundedX, roundedY, this.resolution)
        )

        return true
    }

    private hasCellAtCoordinate = (coordinate: CellCoordinate): boolean => {
        return this.cells.has(coordinate)
    }

    private createCellCoordinate = (x: number, y: number): CellCoordinate => {
        return `[${x}:${y}]`
    }

    private roundToNearest = (number: number, nearest: number = this.resolution): number=> {
        return Math.floor(number / nearest) * nearest
    }
}

export default Conway