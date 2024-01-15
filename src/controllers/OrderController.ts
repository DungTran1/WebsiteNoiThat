import { Request, Response, NextFunction } from 'express'
import { Between, In, MoreThanOrEqual } from 'typeorm'
import AppDataSource, { Order, Product, User, OrderDetail } from '../models'
import { OrderStatus, orderStatusForDisplay } from './ConstData'

const OrderRepository = AppDataSource.getRepository(Order)

function getMonday(date: Date) {
    date = new Date(date)
    const day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6 : 1) // adjust when day is sunday
    return new Date(date.getFullYear(), date.getMonth(), diff)
}

function getBefore30Days(date: Date) {
    date = new Date(date)
    date.setDate(date.getDate() - 30)
    return date
}

class OrderController {
    // [GET] /
    async Index(req: Request, res: Response, next: NextFunction) {
        try {
            const orderList = await OrderRepository.find({
                relations: { user: true },
                order: { orderDate: 'DESC' },
            })
            return res.render('admin/order/index', { orderList, orderStatusForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async Edit(req: Request, res: Response, next: NextFunction) {
        try {
            const orderInfo = await OrderRepository.findOne({
                relations: { user: true, details: { product: true } },
                where: { id: parseInt(req.params.id) },
            })
            if (orderInfo) {
                if (req.method === 'POST') {
                    orderInfo.deliveryAddress = req.body.deliveryAddress
                    orderInfo.note = req.body.note
                    orderInfo.isPaid = req.body.isPaid === 'true'
                    const rs = await OrderRepository.save(orderInfo)
                    if (rs) return res.render('partials/redirect', { msg: 'Cập nhật thông tin thành công', redirect: '/admin/order' })
                }
                res.locals.orderInfo = orderInfo
            }
            return res.render('admin/order/edit', { OrderStatus })
        } catch (error) {
            next(error)
        }
    }

    // [GET | POST] /edit:id
    async SetOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const orderInfo = await OrderRepository.findOne({
                relations: { user: true, details: { product: true } },
                where: { id: parseInt(req.params.id) },
            })
            const newStatus = parseInt(req.body.status)
            if (orderInfo && newStatus) {
                const productEdit: Product[] = []
                if (newStatus === OrderStatus.Confirmed) {
                    for (const details of orderInfo.details) {
                        const product = await AppDataSource.manager.findOneBy(Product, { id: details.product.id })
                        if (product) {
                            if (product.amount < details.amount) return res.json({ message: `Sản phẩm ${product.name} không đủ số lượng đặt hàng, còn lại ${product.amount}` })
                            product.amount -= details.amount
                            productEdit.push(product)
                        }
                    }
                }
                if (newStatus === OrderStatus.Canceled) {
                    for (const details of orderInfo.details) {
                        const product = await AppDataSource.manager.findOneBy(Product, { id: details.product.id })
                        if (product) {
                            product.amount += details.amount
                            await AppDataSource.manager.save(Product, product)
                        }
                    }
                }
                if (newStatus === OrderStatus.Completed) orderInfo.deliveryDate = new Date()
                orderInfo.status = newStatus
                const rs = await OrderRepository.save(orderInfo)
                await AppDataSource.manager.save(Product, productEdit)
                if (rs) return res.json({ success: true, message: 'Cập nhật thành công' })
            }
            res.json({ message: 'Lỗi cập nhật đơn hàng' })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /details:id
    async Details(req: Request, res: Response, next: NextFunction) {
        try {
            const orderInfo = await OrderRepository.findOne({
                relations: { user: true, details: { product: true } },
                where: { id: parseInt(req.params.id) },
            })
            res.render('admin/order/details', { orderInfo, orderStatusForDisplay })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /delete:id
    async Delete(req: Request, res: Response, next: NextFunction) {
        try {
            const order = await OrderRepository.findOneBy({ id: parseInt(req.params.id) })
            if (order) {
                if (![OrderStatus.Unconfirmed, OrderStatus.Canceled].includes(order.status)) return res.json({ message: 'Chỉ được xoá đơn hàng chưa được xác nhận hoặc đã huỷ' })
                const rs = await OrderRepository.remove(order)
                if (rs) return res.json({ message: 'Xoá đơn hàng thành công' })
            }
            res.json({ message: 'Lỗi xoá đơn hàng' })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /profile/order/:id
    async OrderInfo(req: Request, res: Response, next: NextFunction) {
        try {
            res.locals.errors = []
            const orderInfo = await OrderRepository.findOne({
                relations: { details: { product: true } },
                where: { id: Number(req.params.id) },
            })
            if (!orderInfo) return res.redirect('/profile')
            if (req.method === 'POST') {
                if (orderInfo.status !== OrderStatus.Unconfirmed) res.locals.errors.push({ msg: 'Không thể cập nhật khi đơn đã xác nhận' })
                if (req.body.deliveryAddress === '') res.locals.errors.push({ msg: 'Địa chỉ không được để trống' })
                if (res.locals.errors.length === 0) {
                    orderInfo.deliveryAddress = req.body.deliveryAddress
                    orderInfo.note = req.body.note
                    const rs = await OrderRepository.save(orderInfo)
                    if (rs) res.locals.editSuccess = true
                }
            }
            return res.render('profile/orderInfo', { orderInfo })
        } catch (error) {
            next(error)
        }
    }

    async Dashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const orderList = await OrderRepository.find()

            const ordersInWeek = await OrderRepository.findBy({
                orderDate: MoreThanOrEqual(getMonday(new Date())),
                status: In([OrderStatus.Confirmed, OrderStatus.Completed]),
            })
            return res.render('admin/index', { orderList, OrderStatus, ordersInWeek })
        } catch (error) {
            next(error)
        }
    }

    async Revenue(req: Request, res: Response, next: NextFunction) {
        try {
            let toDate = new Date()
            let fromDate = getBefore30Days(toDate)
            if (req.query.fromDate && req.query.toDate) {
                toDate = new Date(req.query.toDate.toString())
                fromDate = new Date(req.query.fromDate.toString())
                if (fromDate > toDate) fromDate = getBefore30Days(toDate)
            }
            const orderList = await OrderRepository.find({
                relations: { user: true },
                where: {
                    orderDate: Between(fromDate, toDate),
                    status: In([OrderStatus.Confirmed, OrderStatus.Completed]),
                },
            })
            return res.render('admin/revenue', { orderList, fromDate, toDate })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /profile/checkout
    async AddUserOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const curUser = await AppDataSource.getRepository(User).findOne({
                relations: { cart: { product: true } },
                where: { id: Number(res.locals.curUser.id) },
            })
            if (curUser && curUser.cart.length > 0) {
                const orderDetailObj = curUser.cart
                    .filter((item) => item.amount <= item.product.amount)
                    .map((item) => ({
                        product: item.product,
                        amount: item.amount,
                        price: (item.product.price - (item.product.price * item.product.discount) / 100) * item.amount,
                    }))
                const orderDetail = AppDataSource.manager.create(OrderDetail, orderDetailObj)
                await AppDataSource.manager.save(orderDetail)

                const order = AppDataSource.manager.create(Order, {
                    deliveryAddress: req.body.diffAddress || curUser.address,
                    orderDate: new Date(),
                    note: req.body.note || '',
                    totalPrice: orderDetail.reduce((total, item) => total + item.price, 0),
                    isPaid: req.body.isPaid || false,
                    user: curUser,
                    details: orderDetail,
                    status: req.body.isPaid ? OrderStatus.Confirmed : OrderStatus.Unconfirmed,
                })
                await AppDataSource.manager.save(order)

                curUser.cart = []
                await AppDataSource.manager.save(curUser)
                return res.render('partials/redirect', { msg: 'Đặt hàng thành công', redirect: '/profile' })
            } else return res.redirect('/profile/cart')
        } catch (error) {
            next(error)
        }
    }
}

export default new OrderController()
