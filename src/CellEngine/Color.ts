type RGB = `rgb(${string})`
type RGBA = `rgba(${string})`
type HEX = `#${string}`

export type SupportedColorFormat = 'transparent' | RGB | RGBA | HEX
  
export class Color {
    constructor(public color: SupportedColorFormat|string) {}

    toString = () => this.color.toString()
}