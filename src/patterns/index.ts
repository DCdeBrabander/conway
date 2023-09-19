import BlinkerPattern from "./blinker"
import CellPattern from "./cell"

export const enum Patterns {
    CELL,
    BLINKER,
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
        default:
            return []
    }
}