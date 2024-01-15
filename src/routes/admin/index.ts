import express from 'express'

import UserController from '../../controllers/UserController'
import OrderController from '../../controllers/OrderController'
import { UserRoles } from '../../controllers/ConstData'
import { validateLogin } from '../../middleware/validate'

import userRouter from './user'
import categoryGroupRouter from './categoryGroup'
import categoryRouter from './category'
import productRouter from './product'
import orderRouter from './order'

const router = express.Router()

router.get('/login', UserController.AdminLogin)
router.post('/login', validateLogin, UserController.AdminLogin)

router.use(UserController.CheckRole([UserRoles.Admin, UserRoles.Manager], '/admin/login'))

/* GET home page. */
router.get('/', OrderController.Dashboard)
router.get('/revenue', OrderController.Revenue)

router.use('/user', userRouter)
router.use('/category-group', categoryGroupRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)
router.use('/order', orderRouter)

export default router
