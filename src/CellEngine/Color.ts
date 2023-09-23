type RGB = `rgb(${string})`
type RGBA = `rgba(${string})`
type HEX = `#${string}`

export type SupportedColorFormat = 'transparent' | RGB | RGBA | HEX
  
export class Color {
    constructor(public color: SupportedColorFormat|string) {
        // super()
    }

    toString = () => this.color.toString()

    getShade = (magnitude:number) => {
        const cleanColorString = this.toString().replace(`#`, ``);

        if (cleanColorString.length === 6) {
            const decimalColor = parseInt(cleanColorString, 16)
            let r = (decimalColor >> 16) + magnitude
                r > 255 && (r = 255)
                r < 0 && (r = 0)

            let g = (decimalColor & 0x0000ff) + magnitude
                g > 255 && (g = 255)
                g < 0 && (g = 0)

            let b = ((decimalColor >> 8) & 0x00ff) + magnitude
                b > 255 && (b = 255)
                b < 0 && (b = 0)
            return `#${(g | (b << 8) | (r << 16)).toString(16)}`
        } 

        return cleanColorString
    }
}