import { Color } from "./Color"
export { CellMath } from "./Math"

export type Dimension = {
    width: number,
    height: number
}

export type Coordinate = {
    x: number,
    y: number
}

export enum States {
    PAUSED = "Paused",
    RUNNING = "Running",
    SINGLE_TICK = "Singe tick",
}

const MAX_FPS: number = 60

/**
 * our underlying draw and (future) p2p/web traffic logic
 * goal: ConwayGame should be main bootstrap file and interface between human/UI and logic
 */
export class CellEngine {
    private context2d: CanvasRenderingContext2D
    private gameState: States = States.PAUSED

    private startFrameTime: number = 0
    private elapsedFrameTime: number = 0

    private _stateCallables: Map<States, Function[]> = new Map()

    public get fps(): number {
        return this._fps
    }
    public set fps(value: number) {
        if (value > MAX_FPS) {
            console.info("Maximum FPS reached: " + MAX_FPS)
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

    constructor (private canvas: HTMLCanvasElement, private _fps: number) {
        this.context2d = canvas.getContext("2d")!
    }

    getContext = () => this.context2d
    getState = () => this.gameState
    setState = (state: States) => this.gameState = state

    /* GAME LOOP */
    run = async (fps: number = 60) => {
        const timeToRun = await this.measureTime(() => {
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
        })
        this.elapsedFrameTime = timeToRun

        setTimeout(() => {
            requestAnimationFrame(this.run)
        }, 1000 / fps)
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

    onRunning = () => this._stateCallables.get(States.RUNNING)?.forEach(callableFunction => callableFunction.call(this))
    onPaused = () => this._stateCallables.get(States.PAUSED)?.forEach((callableFunction => callableFunction.call(this)))
    onTick = () => {
        if (this.allowTick) {
            this._stateCallables.get(States.SINGLE_TICK)?.forEach((callableFunction => callableFunction.call(this)))
            this.allowTick = false
        }
    }

    /* FRAME TIME */
    private _getPerformanceTime = (diff: number = 0) => performance.timeOrigin + performance.now() - (diff > 0 ? diff : 0)
    getCurrentFrameTime = () => this._getPerformanceTime()
    getLastFrameTime = () => this.elapsedFrameTime

    measureTime = async (callable: Function) => {
        const startFrameTime = this._getPerformanceTime()
        await callable.call(this)
        return this._getPerformanceTime(startFrameTime)
    }

    /** GAME STATE MANAGEMENT */
    isRunning = () => this.getState() == States.RUNNING
    isPaused = () => this.getState() == States.PAUSED

    /* CANVAS */
    clearCanvas = () => this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height)
    getCanvas = () => this.canvas
    getCanvasSize = (): Dimension => ({ width: this.canvas.width, height: this.canvas.height })

    setCanvasBackground = (color: Color) => {
        this.setFillColor(color)
        this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    setCanvasSize = (width: number, height: number): this => {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width
        this.canvas.height = height
        return this
    }

    /* SET COLOR */
    setStrokeColor = (color: Color | string) => this.context2d.strokeStyle = color.toString()
    setFillColor = (color: Color | string) => this.context2d.fillStyle = color.toString()
    
    /* DRAW SHAPES */
    drawLine = (startX:number, startY: number, endX:number, endY:number) => {
        this.context2d.lineWidth = 1
        this.context2d.beginPath()
        this.context2d.moveTo(startX, startY)
        this.context2d.lineTo(endX, endY)
        this.context2d.stroke()
    }
    
    drawRectangle = (x: number, y: number, width: number, height: number) => {
        this.context2d.fillRect(x, y, width, height)
    }
    
    drawSquare = (x: number, y: number, size: number) => this.drawRectangle(x, y, size, size)
}