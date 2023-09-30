class Isometric {
    constructor(angle: number) {
        var a = Math.cos(angle)
        var b = Math.sin(angle)
        return [
            a, 0, a,
            -b, 1, b,
            0, 0, 0
        ]
    }
}