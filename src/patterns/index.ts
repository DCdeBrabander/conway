import GliderGunPattern from "./GliderGun"
import SwitchEngine from "./SwitchEngine"
import BlinkerPattern from "./blinker"
import CellPattern from "./cell"
import EaterPattern from "./eater"
import GliderPattern from "./glider"
import HerschelPattern from "./herschel"
import PulsarPattern from "./pulsar"

export enum Patterns {
    CELL = "Cell",
    BLINKER = "Blinker",
    GLIDER = "Glider",
    PULSAR = "Pulsar",
    EATER = "Eater",
    SWITCH_ENGINE = "SwitchEngine",
    GLIDER_GUN = "GliderGun",
    HERSCHEL = "Herschel",
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
        case Patterns.EATER:
            return EaterPattern
        case Patterns.SWITCH_ENGINE:
            return SwitchEngine
        case Patterns.GLIDER_GUN:
            return GliderGunPattern
        case Patterns.HERSCHEL:
            return HerschelPattern
        default:
            console.warn("unsupported pattern requested: " + pattern)
            return []
    }
}