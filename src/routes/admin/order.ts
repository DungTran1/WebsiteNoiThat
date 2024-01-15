import express from 'express'
import OrderController from '../../controllers/OrderController'

const router = express.Router()

/* GET home page. */
router.get('/', OrderController.Index)

router.get('/details/:id', OrderController.Details)

router.get('/edit/:id', OrderController.Edit)
router.post('/edit/:id', OrderController.Edit)

router.post('/set-status/:id', OrderController.SetOrderStatus)

router.post('/delete/:id', OrderController.Delete)

export default router
