import express from 'express'
import CategoryGroupController from '../../controllers/CategoryGroupController'
import upload from '../../middleware/upload'
import { validateCategoryGroup } from '../../middleware/validate'

const router = express.Router()

/* GET home page. */
router.get('/', CategoryGroupController.GetAll)

router.get('/create', CategoryGroupController.Create)
router.post('/create', upload.single('img'), validateCategoryGroup, CategoryGroupController.Create)

router.get('/details/:id', CategoryGroupController.Details)

router.get('/edit/:id', CategoryGroupController.Edit)
router.post('/edit/:id', upload.single('img'), validateCategoryGroup, CategoryGroupController.Edit)

router.post('/delete/:id', CategoryGroupController.Delete)

export default router
