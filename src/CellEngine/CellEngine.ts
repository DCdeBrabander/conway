export { Color } from "./Color"
export { Point } from "./Point"
export { CellMath } from "./Math"

import { Color } from "./Color"
import Point from "./Point"
import { Shape } from "./Shape/Shape"

export const MAX_FPS: number = 60

export enum DrawMode {
    ISOMETRIC = "isometric",
    DEFAULT = "default"
}

export type Dimension = {
    width: number,
    height: number
}

export enum States {
    PAUSED = "Paused",
    RUNNING = "Running",
    SINGLE_TICK = "Singe tick",
}

export type CellConfig = { 
    fpsLimit?: number,
    drawMode?: DrawMode
}

/**
 * our underlying draw and (future) p2p/web traffic logic
 * goal: ConwayGame should be main bootstrap file and interface between human/UI and logic
 */
export class CellEngine {
    static context2d: CanvasRenderingContext2D
    private gameState: States = States.PAUSED
    private drawMode: DrawMode = DrawMode.DEFAULT

    private elapsedFrameTime: number = 0

    private _stateCallables: Map<States, Function[]> = new Map()

    private _fps: number = MAX_FPS
    public get fps(): number {
        return this._fps
    }
    public set fps(value: number) {
        if (value > MAX_FPS) {
            console.info("Maximum FPS is: " + MAX_FPS)
            this._fps = MAX_FPS
        } else {
            this._fps = value
        }
    }

    private _allowTick: boolean = false

    public get allowTick(): boolean {
        return this._allowTick
    }
    public set allowTick(value: boolean) {
        this._allowTick = value
    }

    private shapes: Shape[] = []

    constructor (private canvas: HTMLCanvasElement, private config?: CellConfig) {
        CellEngine.context2d = canvas.getContext("2d")!
        this.drawMode = config?.drawMode ?? this.drawMode

        console.log(this.drawMode)
        if (this.drawMode == DrawMode.ISOMETRIC) {
            let angle1 = 30
            let angle2 = 30 
            var cs = Math.cos(angle1), sn = Math.sin(angle1);
            var h = Math.cos(angle2);
            var a = 100*cs, b = -100*sn, c = 200;
            var d = h*100*sn, e = h*100*cs, f = 200;
            this.getContext().setTransform(a, d, b, e, c, f);
        }
        this.loop()
    }

    getContext = () => CellEngine.context2d
    getState = () => this.gameState
    setState = (state: States) => this.gameState = state

    /* GAME LOOP */
    private loop = async () => {
        const timeToRun = await this.measureGameTime(() => {
            switch (this.getState()) {
                case States.RUNNING: 
                    this.onRunning()
                    break
                case States.PAUSED:
                    this.onPaused()
                    break
                case States.SINGLE_TICK:
                    this.onTick()
                    break
            }

            this.draw()

            setTimeout(() => {
                requestAnimationFrame(this.loop)
            }, 1000 / this.fps)
        })
        this.elapsedFrameTime = timeToRun
    }

    pause = (toggle: boolean = false) => {
        if (toggle) {
            this.setState(
                this.getState() == States.RUNNING 
                ? States.PAUSED
                : States.RUNNING
            )
        } else {
            this.setState(States.PAUSED)
        }
    }
    
    runOnState = (state: States, func: Function) => {
        this._stateCallables.has(state) ? this._stateCallables.get(state)?.push(func) : this._stateCallables.set(state, [func])
    }

    onRunning = () => {
        this._stateCallables.get(States.RUNNING)
            ?.forEach(callableFunction => 
                callableFunction.call(this)
            )
    }
    onPaused = () => {
        this._stateCallables.get(States.PAUSED)
            ?.forEach((callableFunction => 
                callableFunction.call(this)
            )
        )
    }
    onTick = () => {
        if (this.allowTick) {
            this._stateCallables.get(States.SINGLE_TICK)?.forEach((callableFunction => callableFunction.call(this)))
            this.allowTick = false
        }
    }

    draw = () => {
        this.getContext().save()
        this.clearCanvas()

        // TODO order shapes by Z value
        // TODO while loop? OR offscreen-canvas

        for (let s = 0; s <= this.shapes.length - 1; s++) {
            // console.log(s, this.shapes[s] ?? "?")
            this.shapes[s].draw()
        }

        this.getContext().restore()
    }

    /* FRAME TIME */
    private _getPerformanceTime = (diff: number = 0) => performance.timeOrigin + performance.now() - (diff > 0 ? diff : 0)
    getCurrentFrameTime = () => this._getPerformanceTime()
    getLastFrameTime = () => this.elapsedFrameTime

    measureGameTime = async (callable: Function): Promise<number> => {
        const startFrameTime = this._getPerformanceTime()
        await callable.call(this)
        return this._getPerformanceTime(startFrameTime)
    }

    /** GAME STATE MANAGEMENT */
    isRunning = () => this.getState() == States.RUNNING
    isPaused = () => this.getState() == States.PAUSED

    /* CANVAS */
    clearCanvas = () => CellEngine.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height)
    getCanvas = () => this.canvas
    getCanvasSize = (): Dimension => ({ width: this.canvas.width, height: this.canvas.height })

    setCanvasBackground = (color: Color) => {
        this.setFillColor(color)
        CellEngine.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    setCanvasSize = (width: number, height: number): this => {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width
        this.canvas.height = height
        return this
    }

    /* SET COLOR */
    setStrokeColor = (color: Color | string) => CellEngine.context2d.strokeStyle = color.toString()
    setFillColor = (color: Color | string) => CellEngine.context2d.fillStyle = color.toString()
    
    /* DRAW SHAPES */
    static createPoint = (x: number, y: number): Point => {
        return new Point(x, y)
    }
    static createIsometricPoint = (x: number, y: number) => {
        return new Point(x, y).toIsometric() // TODO: probably refactor to child-class of Point: new IsometricPoint() or sumthn'
    }

    addDrawable = (shape: Shape) => {
        this.shapes.push(shape)
    }

    drawIsometricTile = (point: Point, size: number, color: Color) => {    
        const sizeX = size
        const sizeY = size
        const sizeZ = size
        
        // console.log('drawIsometricTile', point.isometric)

        const { x, y } = point

        CellEngine.context2d.fillStyle = color.toString()
        CellEngine.context2d.strokeStyle = color.getShade(-40)

        CellEngine.context2d.beginPath()
        CellEngine.context2d.moveTo(x, y - sizeZ)

        CellEngine.context2d.lineTo(x - sizeX, y - sizeZ - sizeX * 0.5)
        CellEngine.context2d.lineTo(x - sizeX + sizeY, y - sizeZ - (sizeX * 0.5 + sizeY * 0.5))
        CellEngine.context2d.lineTo(x + sizeY, y - sizeZ - sizeY * 0.5)

        CellEngine.context2d.closePath()
        CellEngine.context2d.stroke()

        CellEngine.context2d.fillStyle = color.toString()
        CellEngine.context2d.fill()
    }

    drawLine = (startX:number, startY: number, endX:number, endY:number) => {
        CellEngine.context2d.lineWidth = 2
        CellEngine.context2d.beginPath()
        CellEngine.context2d.moveTo(startX, startY)
        CellEngine.context2d.lineTo(endX, endY)
        CellEngine.context2d.stroke()
    }
}