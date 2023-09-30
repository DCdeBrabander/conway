export class CellMath {
    static toNearestBase:number = 5

    static setNearestRounding = (newNearestBase:number) => this.toNearestBase = newNearestBase

    static roundToNearest = (number: number, nearest: number = this.toNearestBase): number => {
        return Math.floor(number / nearest) * nearest
    }
}