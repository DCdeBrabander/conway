import BlinkerPattern from "./blinker"
import CellPattern from "./cell"
import GliderPattern from "./glider"
import PulsarPattern from "./pulsar"

export enum Patterns {
    CELL = "Cell",
    BLINKER = "Blinker",
    GLIDER = "Glider",
    PULSAR = "Pulsar"
}

/**
 * Return single or two dimensional array of booleans.
 * Every 'true' in this array represents a cell.
 */
export const GetPattern = (pattern: Patterns): number[][] => {
    switch (pattern) {
        case Patterns.CELL: 
            return CellPattern
        case Patterns.BLINKER: 
            return BlinkerPattern
        case Patterns.GLIDER:
            return GliderPattern
        case Patterns.PULSAR:
            return PulsarPattern
        default:
            return []
    }
}