import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import AppDataSource, { Category, CategoryGroup, OrderDetail, Product, User } from '../models'
import { orderStatusForDisplay, userGendersForDisplay } from './ConstData'
import crypto from 'crypto'

enum menuActive {
    HomePage = 1,
    ProductList = 2,
}

function GetFirstDayOfMonth(): Date {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function QbPopularProduct() {
    return AppDataSource.createQueryBuilder(Product, 'product')
        .addSelect((qb) => {
            return qb
                .select('count(*)')
                .from(OrderDetail, 'detail')
                .innerJoin('detail.order', 'order')
                .where('order.orderDate >= :date', { date: GetFirstDayOfMonth() })
                .andWhere('detail.productId = product.id')
        }, 'orderCount')
        .innerJoinAndSelect('product.category', 'category')
        .orderBy('orderCount', 'DESC')
        .addOrderBy('product.id', 'DESC')
}

class HomeController {
    // [GET] /
    async HomePage(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.menuActive = menuActive.HomePage
            res.locals.title = 'Trang chủ'
            const popularCategoryList = await AppDataSource.createQueryBuilder(Category, 'category')
                .addSelect((qb) => {
                    return qb
                        .select('count(*)')
                        .from(OrderDetail, 'detail')
                        .innerJoin('detail.order', 'order')
                        .innerJoin('detail.product', 'product')
                        .where('order.orderDate >= :date', { date: GetFirstDayOfMonth() })
                        .andWhere('product.categoryId = category.id')
                }, 'orderCount')
                .orderBy('orderCount', 'DESC')
                .addOrderBy('category.id', 'DESC')
                .take(6)
                .getMany()

            const popularProducts = await QbPopularProduct().getMany()

            const latestProducts = await AppDataSource.createQueryBuilder(Product, 'product').innerJoinAndSelect('product.category', 'category').orderBy('product.id', 'DESC').getMany()
            return res.render('index', { popularCategoryList, popularProducts, latestProducts })
        } catch (error) {
            next(error)
        }
    }

    async GetDataForHomeLayout(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.categoryGroupList = await AppDataSource.createQueryBuilder(CategoryGroup, 'group').innerJoinAndSelect('group.categories', 'category').getMany()
            return next()
        } catch (error) {
            next(error)
        }
    }

    async ProductList(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.menuActive = menuActive.ProductList
            res.locals.title = 'Danh sách sản phẩm'

            const q = req.query.q?.toString() || ''
            const productQb = QbPopularProduct().where('product.name LIKE :q', { q: `%${q}%` })
            const category = await AppDataSource.manager.findOneBy(Category, {
                id: parseInt(req.params.categoryId),
            })
            if (category) productQb.where('category.id = :categoryId', { categoryId: category.id })

            const page = req.query.page ? parseInt(req.query.page.toString()) : 1
            const productPerPage = 12
            const [productList, totalProduct] = await Promise.all([
                await productQb
                    .skip((page - 1) * productPerPage)
                    .take(productPerPage)
                    .getMany(),
                await productQb.getCount(),
            ])
            const productData = {
                category,
                q,
                page,
                productPerPage,
                totalProduct,
                productList,
            }
            return res.render('productList', { productData })
        } catch (error) {
            next(error)
        }
    }

    async ProductDetails(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.menuActive = menuActive.ProductList
            res.locals.title = 'Chi tiết sản phẩm'

            const productInfo = await AppDataSource.createQueryBuilder(Product, 'product')
                .innerJoinAndSelect('product.category', 'category')
                .leftJoinAndSelect('product.images', 'images')
                .where('product.id = :id', { id: req.params.id })
                .getOne()

            const suggestProducts = await QbPopularProduct()
                .where('product.id != :id', { id: productInfo?.id })
                .andWhere('category.id = :categoryId', { categoryId: productInfo?.category?.id })
                .take(10)
                .getMany()
            return res.render('productDetails', { productInfo, suggestProducts })
        } catch (error) {
            next(error)
        }
    }

    async Wishlist(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.title = 'Danh sách yêu thích'
            return res.render('profile/wishlist')
        } catch (error) {
            next(error)
        }
    }

    async Cart(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.title = 'Giỏ hàng'
            return res.render('profile/cart')
        } catch (error) {
            next(error)
        }
    }

    async Checkout(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.title = 'Đặt hàng'
            const curUser = await AppDataSource.manager.findOne(User, {
                relations: { cart: { product: true } },
                where: { id: Number(res.locals.curUser.id) },
            })
            if (curUser?.cart.length === 0) return res.redirect('/profile/cart')
            return res.render('profile/checkout', { curUser })
        } catch (error) {
            next(error)
        }
    }

    async Profile(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.title = 'Tài khoản của tôi'

            const errors = validationResult(req)
            res.locals.errors = errors.array()

            const curUser = await AppDataSource.manager.findOne(User, {
                relations: { order: true },
                where: { id: Number(res.locals.curUser.id) },
            })
            if (curUser && req.method === 'POST') {
                const { oldPass, newPass, retypePass } = req.body
                const pass = crypto.createHash('sha256').update(oldPass).digest('base64')
                if (oldPass !== '' || newPass !== '') {
                    if (curUser.password !== pass) res.locals.errors.push({ msg: 'Mật khẩu hiện tại không chính xác' })
                    if (newPass.length < 3) res.locals.errors.push({ msg: 'Mật khẩu mới phải từ 3 ký tự trở lên' })
                    if (newPass !== retypePass) res.locals.errors.push({ msg: 'Mật khẩu nhập lại không đúng' })
                }
                if (res.locals.errors.length === 0) {
                    AppDataSource.getRepository(User).merge(curUser, req.body)
                    curUser.password = crypto.createHash('sha256').update(newPass).digest('base64')
                    const rs = await AppDataSource.getRepository(User).save(curUser)
                    if (rs) return res.render('partials/redirect', { msg: 'Cập nhật thông tin thành công', redirect: '/profile' })
                }
            }
            return res.render('profile/index', { curUser, orderStatusForDisplay, userGendersForDisplay })
        } catch (error) {
            next(error)
        }
    }
}

export default new HomeController()
