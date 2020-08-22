import { createCanvas, Canvas } from 'canvas'
import { Point, Line, Rect, createEvenlySpacedLines, Circle } from './geometry'

type Fret = 'x' | number

export interface FretboardOptions {
  title: string
  frets: Fret[]
  startingFret: number
  bgColor: string
}

function drawLine (ctx: CanvasRenderingContext2D, line: Line): void {
  ctx.beginPath()
  ctx.lineTo(line.p1.x, line.p1.y)
  ctx.lineTo(line.p2.x, line.p2.y)
  ctx.stroke()
}

function drawCircle (ctx: CanvasRenderingContext2D, circle: Circle, fill: boolean = true): void {
  ctx.beginPath()
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

export class Fretboard {
  private _frets: Fret[] = []

  constructor (frets: string | Fret[]) {
    this.setFrets(frets)
  }

  get frets (): Fret[] {
    return this._frets
  }

  setFrets (frets: string | Fret[]): Fretboard {
    if (typeof frets === 'string') {
      this._frets = Fretboard.parseFrets(frets)
    } else {
      this._frets = frets
    }
    return this
  }

  static parseFrets (frets: string): Fret[] {
    const fs = frets.includes(',') ? frets.split(',') : frets.split('')
    return fs.map(f => parseInt(f, 10)).map(f => isNaN(f) ? 'x' : f)
  }

  beginDrawing (): FretboardDrawingBuilder {
    return new FretboardDrawingBuilder(this)
  }
}

type BackgroundStyle = string

class FretboardDrawingBuilder {
  private readonly _freboard: Fretboard

  private _background: BackgroundStyle = 'transparent'
  private _title: string = ''
  private _startingFret: number = 1

  constructor (freboard: Fretboard) {
    this._freboard = freboard
  }

  withBackground (background: BackgroundStyle): FretboardDrawingBuilder {
    this._background = background
    return this
  }

  withTitle (title: string): FretboardDrawingBuilder {
    this._title = title
    return this
  }

  fromFret (startingFret: number): FretboardDrawingBuilder {
    this._startingFret = Math.max(startingFret, 1)
    return this
  }

  toPng (): NodeJS.ReadableStream {
    const canvas = this._createCanvas()
    return this._draw(canvas).createPNGStream()
  }

  toJpeg (): NodeJS.ReadableStream {
    const canvas = this._createCanvas()
    return this._draw(canvas).createJPEGStream()
  }

  toSvg (): Buffer {
    const canvas = this._createCanvas('svg')
    return this._draw(canvas).toBuffer()
  }

  toDataUrl (): string {
    const canvas = this._createCanvas()
    return this._draw(canvas).toDataURL()
  }

  private _createCanvas (type?: 'svg' | undefined): Canvas {
    return createCanvas(200, 280, type)
  }

  private _draw (canvas: Canvas): Canvas {
    const ctx = canvas.getContext('2d')

    const fretCount = 6
    const stringCount = 6

    const paddingLeft = 28
    const paddingRight = 28
    const paddingBottom = 28
    const paddingTop = 80

    // background
    ctx.fillStyle = this._background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // title
    ctx.textAlign = 'center'
    ctx.font = '30px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(this._title, 100, 45)

    // fretboard
    const topLeft = new Point(paddingLeft, paddingTop)
    const bottomRight = new Point(canvas.width - paddingRight, canvas.height - paddingBottom)
    const rect = new Rect(topLeft, bottomRight)

    // nut
    ctx.strokeStyle = 'black'
    ctx.lineCap = 'square'
    ctx.lineWidth = 6
    drawLine(ctx, rect.topLine)

    // strings
    ctx.lineWidth = 2
    const strings = createEvenlySpacedLines(rect.leftLine, rect.rightLine, stringCount)
    strings.forEach(s => drawLine(ctx, s))

    // frets
    const fretLines = createEvenlySpacedLines(rect.topLine, rect.bottomLine, fretCount + 1)
    fretLines.forEach(s => drawLine(ctx, s))

    // fingers
    const stringSpacing = (rect.topRight.x - rect.topLeft.x) / (stringCount - 1)
    const fretSpacing = (rect.bottomLeft.y - rect.topLeft.y) / fretCount
    const y = rect.topLeft.y

    // shift frets
    ctx.font = '20px Arial'
    if (this._startingFret > 1) {
      const oldTextBaseline = ctx.textBaseline
      const oldtextAlign = ctx.textAlign
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(this._startingFret.toString(), rect.topLeft.x - 8, rect.topRight.y + fretSpacing / 2)
      ctx.textBaseline = oldTextBaseline
      ctx.textAlign = oldtextAlign
    }
    const frets = this._freboard.frets.map(f => f === 'x' ? f : Math.max(f - this._startingFret + 1, 0))

    frets.forEach((fret, fretIdx) => {
      const x = rect.topLeft.x + fretIdx * stringSpacing
      if (fret === 'x') {
        ctx.fillText('x', x, y - 10)
      } else if (fret === 0) {
        ctx.fillText('o', x, y - 10)
      } else if (fret > 0) {
        const center = new Point(x, y + fretSpacing * (fret - 0.5))
        drawCircle(ctx, new Circle(center, fretSpacing * 0.3))
      }
    })

    return canvas
  }
}
