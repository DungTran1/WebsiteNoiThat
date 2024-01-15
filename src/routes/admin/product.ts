import express from 'express'
import ProductController from '../../controllers/ProductController'
import upload from '../../middleware/upload'
import { validateProduct } from '../../middleware/validate'

const router = express.Router()

/* GET home page. */
router.get('/', ProductController.GetAll)

router.get('/create', ProductController.Create)
router.post('/create', upload.single('img'), validateProduct, ProductController.Create)

router.get('/details/:id', ProductController.Details)

router.get('/edit/:id', ProductController.Edit)
router.post('/edit/:id', upload.single('img'), validateProduct, ProductController.Edit)

router.get('/img-list/:id', ProductController.GetImgList)
router.post('/img-list/add/:id', upload.array('imgUpload'), ProductController.AddImg)
router.post('/img-list/delete/:idImg', ProductController.DeleteImg)

router.post('/delete/:id', ProductController.Delete)

export default router
