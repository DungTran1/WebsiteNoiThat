"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const models_1 = __importStar(require("../models"));
const ConstData_1 = require("./ConstData");
const OrderRepository = models_1.default.getRepository(models_1.Order);
function getMonday(date) {
    date = new Date(date);
    const day = date.getDay(), diff = date.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), diff);
}
function getBefore30Days(date) {
    date = new Date(date);
    date.setDate(date.getDate() - 30);
    return date;
}
class OrderController {
    Index(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderList = yield OrderRepository.find({
                    relations: { user: true },
                    order: { orderDate: 'DESC' },
                });
                return res.render('admin/order/index', { orderList, orderStatusForDisplay: ConstData_1.orderStatusForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Edit(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderInfo = yield OrderRepository.findOne({
                    relations: { user: true, details: { product: true } },
                    where: { id: parseInt(req.params.id) },
                });
                if (orderInfo) {
                    if (req.method === 'POST') {
                        orderInfo.deliveryAddress = req.body.deliveryAddress;
                        orderInfo.note = req.body.note;
                        orderInfo.isPaid = req.body.isPaid === 'true';
                        const rs = yield OrderRepository.save(orderInfo);
                        if (rs)
                            return res.render('partials/redirect', { msg: 'Cập nhật thông tin thành công', redirect: '/admin/order' });
                    }
                    res.locals.orderInfo = orderInfo;
                }
                return res.render('admin/order/edit', { OrderStatus: ConstData_1.OrderStatus });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SetOrderStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderInfo = yield OrderRepository.findOne({
                    relations: { user: true, details: { product: true } },
                    where: { id: parseInt(req.params.id) },
                });
                const newStatus = parseInt(req.body.status);
                if (orderInfo && newStatus) {
                    const productEdit = [];
                    if (newStatus === ConstData_1.OrderStatus.Confirmed) {
                        for (const details of orderInfo.details) {
                            const product = yield models_1.default.manager.findOneBy(models_1.Product, { id: details.product.id });
                            if (product) {
                                if (product.amount < details.amount)
                                    return res.json({ message: `Sản phẩm ${product.name} không đủ số lượng đặt hàng, còn lại ${product.amount}` });
                                product.amount -= details.amount;
                                productEdit.push(product);
                            }
                        }
                    }
                    if (newStatus === ConstData_1.OrderStatus.Canceled) {
                        for (const details of orderInfo.details) {
                            const product = yield models_1.default.manager.findOneBy(models_1.Product, { id: details.product.id });
                            if (product) {
                                product.amount += details.amount;
                                yield models_1.default.manager.save(models_1.Product, product);
                            }
                        }
                    }
                    if (newStatus === ConstData_1.OrderStatus.Completed)
                        orderInfo.deliveryDate = new Date();
                    orderInfo.status = newStatus;
                    const rs = yield OrderRepository.save(orderInfo);
                    yield models_1.default.manager.save(models_1.Product, productEdit);
                    if (rs)
                        return res.json({ success: true, message: 'Cập nhật thành công' });
                }
                res.json({ message: 'Lỗi cập nhật đơn hàng' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Details(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderInfo = yield OrderRepository.findOne({
                    relations: { user: true, details: { product: true } },
                    where: { id: parseInt(req.params.id) },
                });
                res.render('admin/order/details', { orderInfo, orderStatusForDisplay: ConstData_1.orderStatusForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield OrderRepository.findOneBy({ id: parseInt(req.params.id) });
                if (order) {
                    if (![ConstData_1.OrderStatus.Unconfirmed, ConstData_1.OrderStatus.Canceled].includes(order.status))
                        return res.json({ message: 'Chỉ được xoá đơn hàng chưa được xác nhận hoặc đã huỷ' });
                    const rs = yield OrderRepository.remove(order);
                    if (rs)
                        return res.json({ message: 'Xoá đơn hàng thành công' });
                }
                res.json({ message: 'Lỗi xoá đơn hàng' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    OrderInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.errors = [];
                const orderInfo = yield OrderRepository.findOne({
                    relations: { details: { product: true } },
                    where: { id: Number(req.params.id) },
                });
                if (!orderInfo)
                    return res.redirect('/profile');
                if (req.method === 'POST') {
                    if (orderInfo.status !== ConstData_1.OrderStatus.Unconfirmed)
                        res.locals.errors.push({ msg: 'Không thể cập nhật khi đơn đã xác nhận' });
                    if (req.body.deliveryAddress === '')
                        res.locals.errors.push({ msg: 'Địa chỉ không được để trống' });
                    if (res.locals.errors.length === 0) {
                        orderInfo.deliveryAddress = req.body.deliveryAddress;
                        orderInfo.note = req.body.note;
                        const rs = yield OrderRepository.save(orderInfo);
                        if (rs)
                            res.locals.editSuccess = true;
                    }
                }
                return res.render('profile/orderInfo', { orderInfo });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Dashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderList = yield OrderRepository.find();
                const ordersInWeek = yield OrderRepository.findBy({
                    orderDate: (0, typeorm_1.MoreThanOrEqual)(getMonday(new Date())),
                    status: (0, typeorm_1.In)([ConstData_1.OrderStatus.Confirmed, ConstData_1.OrderStatus.Completed]),
                });
                return res.render('admin/index', { orderList, OrderStatus: ConstData_1.OrderStatus, ordersInWeek });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Revenue(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let toDate = new Date();
                let fromDate = getBefore30Days(toDate);
                if (req.query.fromDate && req.query.toDate) {
                    toDate = new Date(req.query.toDate.toString());
                    fromDate = new Date(req.query.fromDate.toString());
                    if (fromDate > toDate)
                        fromDate = getBefore30Days(toDate);
                }
                const orderList = yield OrderRepository.find({
                    relations: { user: true },
                    where: {
                        orderDate: (0, typeorm_1.Between)(fromDate, toDate),
                        status: (0, typeorm_1.In)([ConstData_1.OrderStatus.Confirmed, ConstData_1.OrderStatus.Completed]),
                    },
                });
                return res.render('admin/revenue', { orderList, fromDate, toDate });
            }
            catch (error) {
                next(error);
            }
        });
    }
    AddUserOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const curUser = yield models_1.default.getRepository(models_1.User).findOne({
                    relations: { cart: { product: true } },
                    where: { id: Number(res.locals.curUser.id) },
                });
                if (curUser && curUser.cart.length > 0) {
                    const orderDetailObj = curUser.cart
                        .filter((item) => item.amount <= item.product.amount)
                        .map((item) => ({
                        product: item.product,
                        amount: item.amount,
                        price: (item.product.price - (item.product.price * item.product.discount) / 100) * item.amount,
                    }));
                    const orderDetail = models_1.default.manager.create(models_1.OrderDetail, orderDetailObj);
                    yield models_1.default.manager.save(orderDetail);
                    const order = models_1.default.manager.create(models_1.Order, {
                        deliveryAddress: req.body.diffAddress || curUser.address,
                        orderDate: new Date(),
                        note: req.body.note || '',
                        totalPrice: orderDetail.reduce((total, item) => total + item.price, 0),
                        isPaid: req.body.isPaid || false,
                        user: curUser,
                        details: orderDetail,
                        status: req.body.isPaid ? ConstData_1.OrderStatus.Confirmed : ConstData_1.OrderStatus.Unconfirmed,
                    });
                    yield models_1.default.manager.save(order);
                    curUser.cart = [];
                    yield models_1.default.manager.save(curUser);
                    return res.render('partials/redirect', { msg: 'Đặt hàng thành công', redirect: '/profile' });
                }
                else
                    return res.redirect('/profile/cart');
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new OrderController();
