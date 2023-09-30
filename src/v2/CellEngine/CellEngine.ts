export { Color } from "./Color"
export { Point } from "./Point"
export { CellMath } from "./Math"

import { Color } from "./Color"
import Point, { Point3D } from "./Point"
import BoundingBox from "./Shape/BoundingBox"
import { Shape } from "./Shape/Shape"

export const MAX_FPS: number = 60

// TODO Rename DrawMode to ProjectionType (or something)
export enum DrawMode {
    ISOMETRIC = "isometric",
    DEFAULT = "default"
}

export type Dimension = {
    width: number,
    height: number,
}

export type Dimension3d = {
    width: number,
    height: number,
    depth: number,
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

// export type BoundingBox = {
//     minX: number,
//     maxX: number,
//     minY: number,
//     maxY: number,
//     minZ: number,
//     maxZ: number
// }

/**
 * our underlying draw and (future) p2p/web traffic logic
 * goal: ConwayGame should be main bootstrap file and interface between human/UI and logic
 */
export class CellEngine {
    static context2d: CanvasRenderingContext2D
    private gameState: States = States.RUNNING
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

    /**
     * faster ordering => drawlist:
     * drawOrderIndex (x + y + z) => assetIndex (drawOrderIndex + assetName)
     * 
     * 
     * assetList
     * assetIndex => asset (shape)
     */

    // Simple array of drawable assets ordered by drawOrderIndex (positive int)
    private drawableAssets: Record<DrawMode, Shape[]> = {
        [DrawMode.DEFAULT]: [],
        [DrawMode.ISOMETRIC]: []
    }

    private indexedAssets: Record<DrawMode, Map<string, Shape>> = {
        [DrawMode.DEFAULT]: new Map(),
        [DrawMode.ISOMETRIC]: new Map()
    }

    constructor (private canvas: HTMLCanvasElement, private config?: CellConfig) {
        CellEngine.context2d = canvas.getContext("2d")!
        this.drawMode = config?.drawMode ?? this.drawMode
        this.fps = config?.fpsLimit ?? 60
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
                    this.update()
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

    update = () => {
        // RUN UPDATE ON DRAWABLE SHAPE MAP TO CORRECT ORDER (SUPPOT PLAYER CLIPPING AND STUFF)
        // TODO Optimize, dont need to reorder everything every frame!
        this.drawableAssets[DrawMode.ISOMETRIC] = this.drawableAssets[DrawMode.ISOMETRIC].sort(this.sortShapesByDrawpriority)
        this.drawableAssets[DrawMode.DEFAULT] = this.drawableAssets[DrawMode.DEFAULT].sort(this.sortShapesByDrawpriority)

        // other stuff
        for (const shape of this.drawableAssets[DrawMode.DEFAULT]) {
            if (shape.updatable && shape.visible) {
                shape.update()
            }
        }
        // world stuff
        for (const shape of this.drawableAssets[DrawMode.ISOMETRIC]) {  
            if (shape.updatable && shape.visible) {
                shape.update()
            }
        }
    }
    
    runOnState = (state: States, func: Function) => this._stateCallables.has(state) 
        ? this._stateCallables.get(state)?.push(func) 
        : this._stateCallables.set(state, [func])

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

    on = (eventName: keyof HTMLElementEventMap, callable: Function, bindElement?: HTMLElement | Window) => {
        const eventElement = bindElement ?? this.canvas

        if ( ! eventElement || ! eventElement?.addEventListener) {
            console.warn("Cant add event-listener on: ", eventElement)
            return
        }

        eventElement.addEventListener(eventName, (event) => callable.call(this, event), false)
    }

    off = (eventName: string, eventCallback = () => {}, bindElement?: HTMLElement) => {
        const eventElement = bindElement ?? this.canvas

        if ( ! eventElement || ! eventElement?.addEventListener) {
            console.warn("Cant add event-listener on: ", eventElement)
            return
        }

        eventElement.removeEventListener(eventName, eventCallback)
    }

    /* THE ACTUAL DRAWING OF GAME WORLD */
    draw = () => {
        this.clearCanvas()
        
        this.getContext().save()
        this.drawShapes(this.drawableAssets[DrawMode.DEFAULT])
        this.getContext().restore()

        this.getContext().save()
        this.getContext().translate(this.canvas.width / 2, 200)
        this.drawShapes(this.drawableAssets[DrawMode.ISOMETRIC])
        this.getContext().restore()
    }

    drawShapes = (shapeMap: Shape[]) => {
        for (const shape of shapeMap) {
            if (shape.visible) {
                shape.draw()
                // shape.highlightColor = null
            }
        }
    }

    /* DRAW CODE  */
    // Support Shape's that are collections of other shapes (level of cubes, grid of tiles, ...)
    addShape = (shape: Shape, mode: DrawMode = DrawMode.DEFAULT ) => {
        if (shape.isCollection()) {
            shape.getShapeCollection().forEach((shape) => this.addShape(shape, mode))
            return
        }
        
        shape.bind(this)

        this.drawableAssets[mode].push(shape)
        this.indexedAssets[mode].set(
            shape.toString(),
            shape
        )
    }

    // 3d (x,y,z,)
    getAreaOfShapes = (shape: Shape, areaPointOffset: number = 2, maxResults = 5) => {
        const results = []

        const area = new BoundingBox(
            shape.position, 
            { width: areaPointOffset, height: areaPointOffset, depth: areaPointOffset }
        )

        areaLoop: for (let x = area.minX; x <= area.maxX; x++) {
            for (let y = area.minY; y <= area.maxY; y++) {
                for (let z = area.minZ; z <= area.maxZ; z++) {

                    // find shape by position
                    // TODO we can do more efficient
                    const otherShape = this.indexedAssets[DrawMode.ISOMETRIC].get(new Point3D(x, y, z).toString())

                    if (otherShape) {
                        otherShape.highlightColor = new Color("#00FF00")
                        results.push(otherShape)
                    } 

                    if (results.length >= maxResults){
                        break areaLoop
                    }
                }
            }
        }

        return results
    }

    sortShapesByDrawpriority = (inputA: Shape, inputB: Shape) => {
        if (inputA.getDrawPriority() == inputB.getDrawPriority()) {
            return -1 // 0
        }
        return inputA.getDrawPriority() > inputB.getDrawPriority() ? 1 : -1 
    }

    getWindowoffset = () => {
        return {
            offsetX: this.canvas.width / 2,
            offsetY: 0 //this.canvas.height / 2
        }
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
    getCanvas = (): HTMLCanvasElement => this.canvas
    getCanvasSize = (): Dimension => ({ width: this.canvas.width, height: this.canvas.height })

    setCanvasBackground = (color: Color) => {
        CellEngine.context2d.fillStyle = color.toString()
        CellEngine.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    setCanvasSize = (width: number, height: number): this => {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width
        this.canvas.height = height
        return this
    }

    // other
    getPointFromMouseEvent = (mouseEvent: MouseEvent): Point => {
        const canvas = this.getCanvas()
        const { top, left } = canvas.getBoundingClientRect()

        return new Point(
           mouseEvent.clientX - left,
           mouseEvent.clientY - top
        )
    }

    // Easing
    static easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    static intersect = (boundingBoxA: BoundingBox, boundingBoxB: BoundingBox): boolean => {
        return (boundingBoxA.minX <= boundingBoxB.maxX && boundingBoxA.maxX >= boundingBoxB.minX) &&
               (boundingBoxA.minY <= boundingBoxB.maxY && boundingBoxA.maxY >= boundingBoxB.minY) &&
               (boundingBoxA.minZ <= boundingBoxB.maxZ && boundingBoxA.maxZ >= boundingBoxB.minZ)
    }
}