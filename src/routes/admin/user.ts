import express from 'express'
import UserController from '../../controllers/UserController'
import { UserRoles } from '../../controllers/ConstData'
import { validateCreateUser, validateEditUser } from '../../middleware/validate'

const router = express.Router()

router.use(UserController.CheckRole([UserRoles.Admin], '/admin/login'))

/* GET home page. */
router.get('/', UserController.GetAll)

router.get('/create', UserController.Create)
router.post('/create', validateCreateUser, UserController.Create)

router.get('/details/:id', UserController.Details)

router.get('/edit/:id', UserController.Edit)
router.post('/edit/:id', validateEditUser, UserController.Edit)

router.post('/resetpass/:id', UserController.Resetpass)
router.post('/changepass/:id', UserController.Changepass)

router.post('/delete/:id', UserController.Delete)

export default router
