"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paypal_rest_sdk_1 = __importDefault(require("paypal-rest-sdk"));
const dateformat_1 = __importDefault(require("dateformat"));
const qs_1 = __importDefault(require("qs"));
const crypto_1 = __importDefault(require("crypto"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const HomeController_1 = __importDefault(require("../controllers/HomeController"));
const OrderController_1 = __importDefault(require("../controllers/OrderController"));
const ConstData_1 = require("../controllers/ConstData");
const validate_1 = require("../middleware/validate");
paypal_rest_sdk_1.default.configure({
    mode: 'sandbox',
    client_id: process.env.paypal_ClientId || '',
    client_secret: process.env.paypal_ClientSecret || '',
});
const router = express_1.default.Router();
router.get('/login', UserController_1.default.CustomerLogin);
router.post('/login', validate_1.validateLogin, UserController_1.default.CustomerLogin);
router.post('/register', validate_1.validateCreateUser, UserController_1.default.CustomerRegister);
router.use(UserController_1.default.CheckRole([ConstData_1.UserRoles.Customer, ConstData_1.UserRoles.Manager, ConstData_1.UserRoles.Admin], '/profile/login'));
router.get('/', HomeController_1.default.Profile);
router.post('/edit', validate_1.validateEditUser, HomeController_1.default.Profile);
router.get('/wishlist', HomeController_1.default.Wishlist);
router.get('/cart', HomeController_1.default.Cart);
router.get('/order/:id', OrderController_1.default.OrderInfo);
router.post('/order/:id', OrderController_1.default.OrderInfo);
router.get('/checkout', HomeController_1.default.Checkout);
router.post('/checkout', UserController_1.default.GetUserCartToPay, function (req, res, next) {
    try {
        switch (req.body.payMethod) {
            case 'PayAfter':
                return next();
            case 'VnPay':
                req.session.paymentBody = req.body;
                const date = new Date();
                let vnp_Params = {
                    vnp_Version: '2.1.0',
                    vnp_Command: 'pay',
                    vnp_TmnCode: process.env.vnp_TmnCode,
                    vnp_Locale: 'vn',
                    vnp_CurrCode: 'VND',
                    vnp_TxnRef: (0, dateformat_1.default)(date, 'HHMMss'),
                    vnp_OrderInfo: 'Thanh toán đơn hàng thời gian: ' + (0, dateformat_1.default)(date, 'yyyy-mm-dd HH:MM:ss'),
                    vnp_OrderType: 'billpayment',
                    vnp_Amount: res.locals.userCart.reduce((total, item) => total + item.price, 0) * 100,
                    vnp_ReturnUrl: process.env.vnp_ReturnUrl,
                    vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    vnp_CreateDate: (0, dateformat_1.default)(date, 'yyyymmddHHMMss'),
                };
                vnp_Params = sortObject(vnp_Params);
                const hmac = crypto_1.default.createHmac('sha512', process.env.vnp_HashSecret || '');
                const signData = qs_1.default.stringify(vnp_Params, { encode: false });
                const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
                vnp_Params['vnp_SecureHash'] = signed;
                let vnpUrl = process.env.vnp_Url + '?' + qs_1.default.stringify(vnp_Params, { encode: false });
                return res.redirect(vnpUrl);
            case 'Paypal':
                req.session.paymentBody = req.body;
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
                                items: res.locals.userCart.map((item) => ({
                                    name: item.productName,
                                    sku: 'item',
                                    price: Math.ceil(item.price / 23605),
                                    currency: 'USD',
                                    quantity: item.amount,
                                })),
                            },
                            amount: {
                                currency: 'USD',
                                total: res.locals.userCart.reduce((total, item) => total + Math.ceil(item.price / 23605), 0),
                            },
                            description: 'Payment Date: ' + (0, dateformat_1.default)(new Date(), 'yyyy-mm-dd HH:MM:ss'),
                        },
                    ],
                };
                paypal_rest_sdk_1.default.payment.create(create_payment_json, function (error, payment) {
                    if (error)
                        next(error);
                    else {
                        for (const link of payment.links || []) {
                            if (link.rel === 'approval_url')
                                return res.redirect(link.href);
                        }
                    }
                });
                break;
            default:
                throw new Error('Không tìm thấy phương thức thanh toán');
        }
    }
    catch (err) {
        next(err);
    }
}, OrderController_1.default.AddUserOrder);
router.get('/paypal_return', function (req, res, next) {
    var _a, _b;
    try {
        const paymentId = ((_a = req.query.paymentId) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const payerId = ((_b = req.query.PayerID) === null || _b === void 0 ? void 0 : _b.toString()) || '';
        paypal_rest_sdk_1.default.payment.execute(paymentId, { payer_id: payerId }, function (error, payment) {
            if (error)
                next(error);
            else {
                req.body = Object.assign(Object.assign({}, req.session.paymentBody), { isPaid: true });
                return next();
            }
        });
    }
    catch (err) {
        next(err);
    }
}, OrderController_1.default.AddUserOrder);
router.get('/paypal_cancel', function (req, res, next) {
    try {
        return res.render('partials/redirect', { msg: 'Lỗi đặt hàng', redirect: '/profile/cart' });
    }
    catch (err) {
        next(err);
    }
});
router.get('/vnpay_return', function (req, res, next) {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];
        const status = vnp_Params['vnp_TransactionStatus'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);
        var hmac = crypto_1.default.createHmac('sha512', process.env.vnp_HashSecret || '');
        var signData = qs_1.default.stringify(vnp_Params, { encode: false });
        var signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
        if (secureHash === signed && status === '00') {
            req.body = Object.assign(Object.assign({}, req.session.paymentBody), { isPaid: true });
            return next();
        }
        else {
            return res.render('partials/redirect', { msg: 'Lỗi đặt hàng', redirect: '/profile/cart' });
        }
    }
    catch (err) {
        next(err);
    }
}, OrderController_1.default.AddUserOrder);
function sortObject(obj) {
    const sorted = {};
    const str = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}
exports.default = router;
