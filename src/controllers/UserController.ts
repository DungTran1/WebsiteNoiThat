import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import { In } from 'typeorm'
import AppDataSource, { Cart, Order, OrderDetail, Product, User } from '../models'
import { UserRoles, userRolesForDisplay, userGendersForDisplay } from './ConstData'

const UserRepository = AppDataSource.getRepository(User)

class UserController {
    // [GET] /
    async GetAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userList = await UserRepository.find()
            return res.render('admin/user/index', { userList, userRolesForDisplay, userGendersForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /create
    async Create(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()
            if (req.method === 'POST' && errors.isEmpty()) {
                const exist = await UserRepository.exist({ where: { username: req.body.username } })
                if (exist) {
                    res.locals.errors.push({ msg: 'Tài khoản đã tồn tại', param: 'username' })
                }

                if (res.locals.errors.length === 0) {
                    const user = await UserRepository.create(req.body as Object)
                    user.password = crypto.createHash('sha256').update(user.password).digest('base64')
                    const rs = await UserRepository.save(user)
                    if (rs) res.locals.createSuccess = true
                }
            }
            return res.render('admin/user/create', { userRolesForDisplay, userGendersForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async Edit(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()

            const user = await UserRepository.findOneBy({ id: parseInt(req.params.id) })
            if (user) {
                if (req.method === 'POST' && errors.isEmpty()) {
                    UserRepository.merge(user, req.body)
                    const rs = await UserRepository.save(user)
                    if (rs) res.locals.editSuccess = true
                }
                res.locals.userInfo = user
            }
            return res.render('admin/user/edit', { userRolesForDisplay, userGendersForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /resetpass:id
    async Resetpass(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserRepository.findOneBy({ id: parseInt(req.params.id) })
            let rs: User | null = null
            if (user) {
                user.password = crypto.createHash('sha256').update('123').digest('base64')
                rs = await UserRepository.save(user)
            }
            res.json({ message: rs ? 'Đã cập nhật mật khẩu' : 'Cập nhật lỗi' })
        } catch (error) {
            res.json({ message: 'Lỗi đặt lại mật khẩu' })
        }
    }

    // [POST] /changepass:id
    async Changepass(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.newPass !== req.body.retypePass) return res.json('Mật khẩu nhập lại không đúng')
            const user = await UserRepository.findOneBy({
                id: parseInt(req.params.id),
                password: crypto.createHash('sha256').update(req.body.oldPass).digest('base64'),
            })
            if (user) {
                user.password = crypto.createHash('sha256').update(req.body.newPass).digest('base64')
                await UserRepository.save(user)
                res.json('Đổi mật khẩu thành công')
            } else {
                res.json('Mật khẩu hiện tại không chính xác')
            }
        } catch (error) {
            res.json('Lỗi đổi mật khẩu')
        }
    }

    // [GET] /details:id
    async Details(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserRepository.findOneBy({ id: parseInt(req.params.id) })
            return res.render('admin/user/details', { userInfo: user, userRolesForDisplay, userGendersForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /delete:id
    async Delete(req: Request, res: Response, next: NextFunction) {
        try {
            const rs = await UserRepository.delete(req.params.id)
            res.json({ message: rs.affected === 0 ? 'Lỗi xoá người dùng' : 'Xoá người dùng thành công' })
        } catch (error) {
            next(error)
        }
    }

    // Authentication

    // [GET | POST] /admin/login
    async AdminLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.errors = errors.array()
            if (req.method === 'POST' && errors.isEmpty()) {
                const password = crypto.createHash('sha256').update(req.body.password).digest('base64')
                const user = await UserRepository.findOneBy({
                    username: req.body.username,
                    password,
                    role: In([UserRoles.Admin, UserRoles.Manager]),
                })
                if (user) {
                    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY || 'secret', { expiresIn: '1d' })
                    const cookieExpires = req.body.rememberPass === 'on' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
                    res.cookie('token', token, { expires: cookieExpires })
                    return res.redirect('/admin')
                } else res.locals.errors.push({ msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác!' })
            }
            return res.render('admin/login')
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /profile/login
    async CustomerLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.loginErrors = errors.array()
            if (req.method === 'POST' && errors.isEmpty()) {
                const password = crypto.createHash('sha256').update(req.body.password).digest('base64')
                const user = await UserRepository.findOneBy({
                    username: req.body.username,
                    password,
                    role: In([UserRoles.Admin, UserRoles.Manager, UserRoles.Customer]),
                })
                if (user) {
                    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY || 'secret', { expiresIn: '1d' })
                    const cookieExpires = req.body.rememberPass === 'on' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
                    res.cookie('token', token, { expires: cookieExpires })
                    return res.redirect('/')
                } else res.locals.loginErrors.push({ msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác!' })
            }
            return res.render('profile/login', { userGendersForDisplay, page: 'login' })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /profile/register
    async CustomerRegister(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req)
            res.locals.registerErrors = errors.array()
            if (errors.isEmpty()) {
                const exist = await UserRepository.exist({ where: { username: req.body.username } })
                if (exist) res.locals.registerErrors.push({ msg: 'Tài khoản đã tồn tại', param: 'username' })

                if (res.locals.registerErrors.length === 0) {
                    const user = await UserRepository.create(req.body as Object)
                    user.password = crypto.createHash('sha256').update(user.password).digest('base64')
                    const rs = await UserRepository.save(user)
                    if (rs) res.locals.createSuccess = true
                }
            }
            return res.render('profile/login', { userGendersForDisplay, page: 'register' })
        } catch (error) {
            next(error)
        }
    }

    // use authenticate before routes
    async Authenticate(req: Request, res: Response, next: NextFunction) {
        try {
            const token = jwt.verify(req.cookies.token, process.env.SECRET_KEY || 'secret') as JwtPayload
            const curUser = await UserRepository.findOneBy({ id: token.id })
            if (curUser) res.locals.curUser = curUser
            next()
        } catch (error) {
            next()
        }
    }

    CheckRole(roles: UserRoles[], redirectUrl: string) {
        return function (req: Request, res: Response, next: NextFunction) {
            if (res.locals.curUser && roles.includes(res.locals.curUser.role)) {
                return next()
            }
            return res.redirect(redirectUrl)
        }
    }

    // [GET] api/user-info
    async UserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json(null)
            const curUser = await UserRepository.findOne({
                relations: { wishlist: true, cart: { product: true } },
                where: { id: res.locals.curUser.id },
            })
            res.json(curUser)
        } catch (error) {
            next(error)
        }
    }

    // [POST] api/add-wishlist
    async AddToWishlist(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json('Bạn chưa đăng nhập !')
            const curUser = await UserRepository.findOne({
                relations: { wishlist: true },
                where: { id: Number(res.locals.curUser.id) },
            })
            const product = await AppDataSource.manager.findOneBy(Product, {
                id: Number(req.body.productId),
            })
            if (curUser && product) {
                if (!curUser.wishlist.some((item) => item.id === product.id)) {
                    curUser.wishlist.push(product)
                    await UserRepository.save(curUser)
                }
                return res.json('Đã thêm sản phẩm vào danh sách yêu thích')
            }
            res.json('Lỗi thêm sản phẩm')
        } catch (error) {
            next(error)
        }
    }

    // [POST] api/remove-wishlist
    async RemoveFromWishlist(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json({ err: 'Bạn chưa đăng nhập !' })
            const curUser = await UserRepository.findOne({
                relations: { wishlist: true },
                where: { id: Number(res.locals.curUser.id) },
            })
            const product = await AppDataSource.manager.findOneBy(Product, {
                id: Number(req.body.productId),
            })
            if (curUser && product) {
                curUser.wishlist = curUser.wishlist.filter((item) => item.id !== product.id)
                await UserRepository.save(curUser)
                return res.json('Xoá sản phẩm khỏi DS yêu thích thành công')
            }
            return res.json({ err: 'Lỗi xoá sản phẩm khỏi DS yêu thích' })
        } catch (error) {
            next(error)
        }
    }

    // [POST] api/add-cart
    async AddToCart(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json('Bạn chưa đăng nhập !')
            const curUser = await UserRepository.findOne({
                where: { id: Number(res.locals.curUser.id) },
            })
            const product = await AppDataSource.manager.findOneBy(Product, {
                id: Number(req.body.productId),
            })
            if (curUser && product) {
                const cartAmount = req.body.amount
                if (cartAmount && cartAmount > product.amount) return res.json(`Hiện sản phẩm: ${product.name} không còn đủ để đặt hàng. Còn lại ${product.amount}`)
                const userCart = await AppDataSource.manager.findOneBy(Cart, {
                    user: { id: curUser.id },
                    product: { id: product.id },
                })
                if (userCart) {
                    userCart.amount = req.body.amount || 1
                    await AppDataSource.manager.save(userCart)
                    return res.json('Đã cập nhật giỏ hàng')
                } else {
                    const cart = new Cart()
                    cart.user = curUser
                    cart.product = product
                    cart.amount = req.body.amount || 1
                    await AppDataSource.manager.save(cart)
                    return res.json('Đã thêm sản phẩm vào giỏ hàng')
                }
            }
            res.json('Lỗi thêm sản phẩm')
        } catch (error) {
            next(error)
        }
    }

    // [POST] api/remove-cart
    async RemoveFromCart(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json({ err: 'Bạn chưa đăng nhập !' })
            const curUser = await UserRepository.findOne({
                where: { id: Number(res.locals.curUser.id) },
            })
            const product = await AppDataSource.manager.findOneBy(Product, {
                id: Number(req.body.productId),
            })
            if (curUser && product) {
                const userCart = await AppDataSource.manager.findOneBy(Cart, {
                    user: { id: curUser.id },
                    product: { id: product.id },
                })
                if (userCart) await AppDataSource.manager.remove(Cart, userCart)
                return res.json('Xoá sản phẩm khỏi giỏ hàng thành công')
            }
            return res.json({ err: 'Lỗi xoá sản phẩm khỏi giỏ hàng' })
        } catch (error) {
            next(error)
        }
    }

    async GetUserCartToPay(req: Request, res: Response, next: NextFunction) {
        try {
            if (!res.locals.curUser) return res.json({ err: 'Bạn chưa đăng nhập !' })
            const curUser = await UserRepository.findOne({
                relations: { cart: { product: true } },
                where: { id: Number(res.locals.curUser.id) },
            })
            res.locals.userCart =
                curUser?.cart
                    .filter((item) => item.amount <= item.product.amount)
                    .map((item) => ({
                        productName: item.product.name,
                        amount: item.amount,
                        price: Math.ceil((item.product.price - (item.product.price * item.product.discount) / 100) * item.amount),
                    })) || []
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()
