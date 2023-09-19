import BlinkerPattern from "./blinker"
import CellPattern from "./cell"
import GliderPattern from "./glider"

export enum Patterns {
    CELL = "Cell",
    BLINKER = "Blinker",
    GLIDER = "Glider"
}

/**
 * Return single or two dimensional array of booleans.
 * Every 'true' in this array represents a cell.
 */
export const GetPattern = (pattern: Patterns): boolean[][] => {
    switch (pattern) {
        case Patterns.CELL: 
            return CellPattern
        case Patterns.BLINKER: 
            return BlinkerPattern
        case Patterns.GLIDER:
            return GliderPattern
        default:
            return []
    }
}