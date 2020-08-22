import { Router } from 'express'
import { ParsedQs } from 'qs'
import { Fretboard } from '@fretnot/fretboard'

const router = Router()

function stringOrDefault (s: string | any, defaultString: string = ''): string {
  return typeof s === 'string' ? s : defaultString
}

function sanitizeQuery (query: ParsedQs): FretboardQuery {
  return {
    title: stringOrDefault(query.title),
    frets: stringOrDefault(query.frets),
    startingFret: parseInt(stringOrDefault(query.startingFret, '1')),
    bgColor: stringOrDefault(query.bg, 'rgba(0,0,0,0)')
  }
}

interface FretboardQuery {
  title: string
  frets: string
  startingFret: number
  bgColor: string
}

router.get('/fretboard.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml')
  const query = sanitizeQuery(req.query)
  const fretboard = new Fretboard(query.frets)
  const buffer = fretboard.beginDrawing()
    .withTitle(query.title)
    .withBackground(query.bgColor)
    .fromFret(query.startingFret)
    .toSvg()
  res.write(buffer)
  res.status(200).send()
})

router.get('/fretboard.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png')
  const query = sanitizeQuery(req.query)
  const fretboard = new Fretboard(query.frets)
  const stream = fretboard.beginDrawing()
    .withTitle(query.title)
    .withBackground(query.bgColor)
    .fromFret(query.startingFret)
    .toPng()
  stream.pipe(res)
  setTimeout(() => {
    stream.unpipe(res)
    res.status(200).send()
  }, 2000)
})

export default router
