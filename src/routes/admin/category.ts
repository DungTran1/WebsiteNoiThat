import express from 'express'
import CategoryController from '../../controllers/CategoryController'
import upload from '../../middleware/upload'
import { validateCategory } from '../../middleware/validate'

const router = express.Router()

/* GET home page. */
router.get('/', CategoryController.GetAll)

router.get('/create', CategoryController.Create)
router.post('/create', upload.single('img'), validateCategory, CategoryController.Create)

router.get('/details/:id', CategoryController.Details)

router.get('/edit/:id', CategoryController.Edit)
router.post('/edit/:id', upload.single('img'), validateCategory, CategoryController.Edit)

router.post('/delete/:id', CategoryController.Delete)

export default router
