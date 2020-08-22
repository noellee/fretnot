import express, { json, urlencoded, static as static_files } from 'express'
import { join } from 'path'
import logger from 'morgan'

import indexRouter from './routes'

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(static_files(join(__dirname, 'public')))

app.use('/', indexRouter)

export default app
