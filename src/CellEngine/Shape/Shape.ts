export abstract class Shape {
    abstract draw(): void
}


export type ShapeStyle = {
    strokeStyle?: string
    fillStyle?: string,
    lineWidth?: number
}
