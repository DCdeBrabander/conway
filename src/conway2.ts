import { CellConfig, CellEngine, CellMath, DrawMode, Point, States } from "./CellEngine/CellEngine";
import IsometricGrid from "./Conway/IsometricGrid";

type ConwayConfig = CellConfig & {
    cellSize?: number,
    heightOffset?: number
}

class Conway2 extends CellEngine {
     constructor (
        canvasElement: HTMLCanvasElement, 
        private instanceConfig: ConwayConfig = { 
            cellSize: 20,
            fpsLimit: 60,
            heightOffset: 0,
        }
    ) {
        super(canvasElement, {drawMode: DrawMode.ISOMETRIC})
        this.setup()
        return this
    }
    setup = () => {
        this.setCanvasSize(
            window.innerWidth,
            window.innerHeight - (this.instanceConfig?.heightOffset ?? 0)
        )

        const { width, height } = this.getCanvas()

        this.addDrawable(
            new IsometricGrid(
                new Point(0, 0), 
                new Point(width, height), 
                (this.instanceConfig?.cellSize ?? 20)
            )
        )
    }
}

export default Conway2