export { Color } from "./Color"
export { Point } from "./Point"
export { CellMath } from "./Math"

import Point, { Point3D } from "./Point"
import Renderer from "./Renderer"
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
    fpsLimit: number,
    drawMode?: DrawMode
}

/**
 * our underlying draw and (future) p2p/web traffic logic
 * goal: ConwayGame should be main bootstrap file and interface between human/UI and logic
 */
export class CellEngine extends Renderer {
    private _stateCallables: Map<States, Function[]> = new Map()

    public config: CellConfig = {
        drawMode: DrawMode.DEFAULT,
        fpsLimit: 10
    }

    private gameState: States = States.RUNNING
    private elapsedFrameTime: number = 0

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

    constructor (canvas: HTMLCanvasElement) {
        super(canvas)
        this.loop()
    }

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
            }, 1000 / this.config.fpsLimit)
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
        const sortedDefaultAssets = this.getDrawables(DrawMode.DEFAULT).sort(this.sortShapesByDrawpriority)
        const sortedIsometricAssets = this.getDrawables(DrawMode.ISOMETRIC).sort(this.sortShapesByDrawpriority)

        // other stuff
        for (const shape of sortedDefaultAssets) {
            if (shape.updatable && shape.visible) {
                shape.update()
            }
        }
        // world stuff
        for (const shape of sortedIsometricAssets) {  
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

    setConfig = (config: CellConfig) => this.config = config

    getState = () => this.gameState
    setState = (state: States) => this.gameState = state

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

    addShape = (shape: Shape, drawMode?: DrawMode) => {
        if (shape.isCollection()) {
            shape.getShapeCollection().forEach((shape) => this.addShape(shape, drawMode))
            return
        }
        shape.bind(this)
        // console.log('addShape, ', shape)
        this.addDrawable(shape, drawMode)
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
                    const otherShape = this.getIndexedAssets(DrawMode.ISOMETRIC).get(new Point3D(x, y, z).toString())

                    if (otherShape) {
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