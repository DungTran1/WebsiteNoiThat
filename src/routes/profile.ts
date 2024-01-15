import express, { Request, Response, NextFunction } from 'express'
import paypal from 'paypal-rest-sdk'
import DateFormat from 'dateformat'
import querystring from 'qs'
import crypto from 'crypto'

import UserController from '../controllers/UserController'
import HomeController from '../controllers/HomeController'
import OrderController from '../controllers/OrderController'
import { UserRoles } from '../controllers/ConstData'
import { validateCreateUser, validateEditUser, validateLogin } from '../middleware/validate'

paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: process.env.paypal_ClientId || '',
    client_secret: process.env.paypal_ClientSecret || '',
})

const router = express.Router()

router.get('/login', UserController.CustomerLogin)
router.post('/login', validateLogin, UserController.CustomerLogin)
router.post('/register', validateCreateUser, UserController.CustomerRegister)

router.use(UserController.CheckRole([UserRoles.Customer, UserRoles.Manager, UserRoles.Admin], '/profile/login'))

router.get('/', HomeController.Profile)
router.post('/edit', validateEditUser, HomeController.Profile)

router.get('/wishlist', HomeController.Wishlist)
router.get('/cart', HomeController.Cart)

router.get('/order/:id', OrderController.OrderInfo)
router.post('/order/:id', OrderController.OrderInfo)

router.get('/checkout', HomeController.Checkout)

router.post(
    '/checkout',
    UserController.GetUserCartToPay,
    function (req: Request, res: Response, next: NextFunction) {
        try {
            switch (req.body.payMethod) {
                case 'PayAfter':
                    return next()
                case 'VnPay':
                    req.session.paymentBody = req.body
                    const date = new Date()

                    let vnp_Params: any = {
                        vnp_Version: '2.1.0',
                        vnp_Command: 'pay',
                        vnp_TmnCode: process.env.vnp_TmnCode,
                        vnp_Locale: 'vn',
                        vnp_CurrCode: 'VND',
                        vnp_TxnRef: DateFormat(date, 'HHMMss'),
                        vnp_OrderInfo: 'Thanh toán đơn hàng thời gian: ' + DateFormat(date, 'yyyy-mm-dd HH:MM:ss'),
                        vnp_OrderType: 'billpayment',
                        vnp_Amount: res.locals.userCart.reduce((total: any, item: any) => total + item.price, 0) * 100,
                        vnp_ReturnUrl: process.env.vnp_ReturnUrl,
                        vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                        vnp_CreateDate: DateFormat(date, 'yyyymmddHHMMss'),
                    }
                    vnp_Params = sortObject(vnp_Params)

                    const hmac = crypto.createHmac('sha512', process.env.vnp_HashSecret || '')
                    const signData = querystring.stringify(vnp_Params, { encode: false })
                    const signed = hmac.update(new (Buffer.from as any)(signData, 'utf-8')).digest('hex')
                    vnp_Params['vnp_SecureHash'] = signed

                    let vnpUrl = process.env.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false })
                    return res.redirect(vnpUrl)
                case 'Paypal':
                    req.session.paymentBody = req.body
                    const create_payment_json = {
                        intent: 'sale',
                        payer: {
                            payment_method: 'paypal',
                        },
                        redirect_urls: {
                            return_url: process.env.paypal_ReturnUrl,
                            cancel_url: process.env.paypal_CancelUrl,
                        },
                        transactions: [
                            {
                                item_list: {
                                    items: res.locals.userCart.map((item: any) => ({
                                        name: item.productName,
                                        sku: 'item',
                                        price: Math.ceil(item.price / 23605),
                                        currency: 'USD',
                                        quantity: item.amount,
                                    })),
                                },
                                amount: {
                                    currency: 'USD',
                                    total: res.locals.userCart.reduce((total: any, item: any) => total + Math.ceil(item.price / 23605), 0),
                                },
                                description: 'Payment Date: ' + DateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
                            },
                        ],
                    }
                    paypal.payment.create(create_payment_json, function (error, payment) {
                        if (error) next(error)
                        else {
                            for (const link of payment.links || []) {
                                if (link.rel === 'approval_url') return res.redirect(link.href)
                            }
                        }
                    })
                    break
                default:
                    throw new Error('Không tìm thấy phương thức thanh toán')
            }
        } catch (err) {
            next(err)
        }
    },
    OrderController.AddUserOrder
)

router.get(
    '/paypal_return',
    function (req: Request, res: Response, next: NextFunction) {
        try {
            const paymentId = req.query.paymentId?.toString() || ''
            const payerId = req.query.PayerID?.toString() || ''
            paypal.payment.execute(paymentId, { payer_id: payerId }, function (error, payment) {
                if (error) next(error)
                else {
                    req.body = { ...req.session.paymentBody, isPaid: true }
                    return next()
                }
            })
        } catch (err) {
            next(err)
        }
    },
    OrderController.AddUserOrder
)
router.get('/paypal_cancel', function (req: Request, res: Response, next: NextFunction) {
    try {
        return res.render('partials/redirect', { msg: 'Lỗi đặt hàng', redirect: '/profile/cart' })
    } catch (err) {
        next(err)
    }
})

router.get(
    '/vnpay_return',
    function (req: Request, res: Response, next: NextFunction) {
        try {
            let vnp_Params = req.query
            const secureHash = vnp_Params['vnp_SecureHash']
            const status = vnp_Params['vnp_TransactionStatus'];

            delete vnp_Params['vnp_SecureHash']
            delete vnp_Params['vnp_SecureHashType']

            vnp_Params = sortObject(vnp_Params)

            var hmac = crypto.createHmac('sha512', process.env.vnp_HashSecret || '')
            var signData = querystring.stringify(vnp_Params, { encode: false })
            var signed = hmac.update(new (Buffer.from as any)(signData, 'utf-8')).digest('hex')

            if (secureHash === signed && status === '00') {
                //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
                req.body = { ...req.session.paymentBody, isPaid: true }
                return next()
            } else {
                // thất bại
                return res.render('partials/redirect', { msg: 'Lỗi đặt hàng', redirect: '/profile/cart' })
            }
        } catch (err) {
            next(err)
        }
    },
    OrderController.AddUserOrder
)
// router.get('/vnpay_ipn', OrderController.AddUserOrder)

function sortObject(obj: any) {
    const sorted: any = {}
    const str = []
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key))
        }
    }
    str.sort()
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
}

export default router
