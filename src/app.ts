import dotenv from 'dotenv'
import createError, { HttpError } from 'http-errors'
import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import session from 'express-session'

dotenv.config()
import homeRouter from './routes/home'
import profileRouter from './routes/profile'
import adminRouter from './routes/admin'
import apiRouter from './routes/api'

import UserController from './controllers/UserController'
import AppDataSource from './models'
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!')
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err)
    })
const port = process.env.SERVER_PORT
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({ secret: process.env.SECRET_KEY || 'secret', cookie: { maxAge: 24 * 60 * 60 * 1000 }, resave: false, saveUninitialized: true }))
declare module 'express-session' {
    interface SessionData {
        paymentBody: { [key: string]: any }
    }
}

// authentication
app.use(UserController.Authenticate)

// main route
app.use('/', homeRouter)
app.use('/profile', profileRouter)
app.use('/admin', adminRouter)

app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    next(createError(404, 'Page not found'))
})

// error handler
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.status = err.status
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500).render('error')
})

app.listen(port, function () {
    console.log(`Server is listening on http://localhost:${port}`)
})
