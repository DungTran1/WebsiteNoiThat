import express from 'express'
import HomeController from '../controllers/HomeController'

const router = express.Router()

router.use(HomeController.GetDataForHomeLayout)

/* GET users listing. */
router.get('/', HomeController.HomePage)
router.get('/product-list/:categoryId?', HomeController.ProductList)
router.get('/product/:id', HomeController.ProductDetails)

export default router
