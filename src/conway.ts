import Cell from "./cell";

class Conway {
    cells: Cell[] = []
    canvasElement: HTMLCanvasElement|null
    canvasContext: CanvasRenderingContext2D|null
    fps: number = 1;

    constructor (canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement as HTMLCanvasElement
        this.canvasContext = this.canvasElement!.getContext("2d")

        // load cells / game
        this.cells.push(new Cell(100, 100, 10))

        requestAnimationFrame(this.draw);       
    }

    draw = () => {
        const CELL_WIDTH = 10
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
}

export default Conway