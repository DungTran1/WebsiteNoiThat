import express, { NextFunction, Request, Response } from 'express'
import UserController from '../../controllers/UserController'

const router = express.Router()

router.get('/user-info', UserController.UserInfo)

router.post('/add-wishlist', UserController.AddToWishlist)
router.post('/remove-wishlist', UserController.RemoveFromWishlist)

router.post('/add-cart', UserController.AddToCart)
router.post('/remove-cart', UserController.RemoveFromCart)

router.use(function (req: Request, res: Response, next: NextFunction) {
    res.status(404).json('API not found')
})

router.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    res.status(500).json(err.message)
})

export default router
