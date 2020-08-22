export class Point {
  private readonly _x: number
  private readonly _y: number

  constructor (x: number, y: number) {
    this._x = x
    this._y = y
  }

  get x (): number {
    return this._x
  }

  get y (): number {
    return this._y
  }

  public plus (other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y)
  }

  public minus (other: Point): Point {
    return this.plus(other.negate())
  }

  public negate (): Point {
    return new Point(-this.x, -this.y)
  }

  public times (n: number): Point {
    return new Point(this.x * n, this.y * n)
  }

  public dividedBy (n: number): Point {
    return new Point(this.x / n, this.y / n)
  }
}

export class Circle {
  public center: Point
  public radius: number

  constructor (center: Point, radius: number) {
    this.center = center
    this.radius = radius
  }
}

export class Line {
  public p1: Point
  public p2: Point

  constructor (p1: Point, p2: Point) {
    this.p1 = p1
    this.p2 = p2
  }

  public plus (other: Line): Line {
    return new Line(this.p1.plus(other.p1), this.p2.plus(other.p2))
  }

  public minus (other: Line): Line {
    return this.plus(other.negate())
  }

  public negate (): Line {
    return new Line(this.p1.negate(), this.p2.negate())
  }

  public times (n: number): Line {
    return new Line(this.p1.times(n), this.p2.times(n))
  }

  public dividedBy (n: number): Line {
    return new Line(this.p1.dividedBy(n), this.p2.dividedBy(n))
  }
}

export class Rect {
  private readonly _topLeft: Point
  private readonly _bottomRight: Point

  constructor (topLeft: Point, bottomRight: Point) {
    this._topLeft = topLeft
    this._bottomRight = bottomRight
  }

  get topLeft (): Point {
    return this._topLeft
  }

  get bottomRight (): Point {
    return this._bottomRight
  }

  get topRight (): Point {
    return new Point(this._bottomRight.x, this._topLeft.y)
  }

  get bottomLeft (): Point {
    return new Point(this.topLeft.x, this._bottomRight.y)
  }

  get topLine (): Line {
    return new Line(this.topLeft, this.topRight)
  }

  get bottomLine (): Line {
    return new Line(this.bottomLeft, this.bottomRight)
  }

  get leftLine (): Line {
    return new Line(this.topLeft, this.bottomLeft)
  }

  get rightLine (): Line {
    return new Line(this.topRight, this.bottomRight)
  }
}

export function createEvenlySpacedLines (line1: Line, line2: Line, nInclusive: number): Line[] {
  const n = nInclusive - 1
  const delta1 = line2.p1.minus(line1.p1).dividedBy(n)
  const delta2 = line2.p2.minus(line1.p2).dividedBy(n)
  const lineDelta = new Line(delta1, delta2)
  const lines = []
  for (var i = 0; i <= n; i++) {
    lines.push(line1.plus(lineDelta.times(i)))
  }
  return lines
}
