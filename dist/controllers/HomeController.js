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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const models_1 = __importStar(require("../models"));
const ConstData_1 = require("./ConstData");
const crypto_1 = __importDefault(require("crypto"));
var menuActive;
(function (menuActive) {
    menuActive[menuActive["HomePage"] = 1] = "HomePage";
    menuActive[menuActive["ProductList"] = 2] = "ProductList";
})(menuActive || (menuActive = {}));
function GetFirstDayOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function QbPopularProduct() {
    return models_1.default.createQueryBuilder(models_1.Product, 'product')
        .addSelect((qb) => {
        return qb
            .select('count(*)')
            .from(models_1.OrderDetail, 'detail')
            .innerJoin('detail.order', 'order')
            .where('order.orderDate >= :date', { date: GetFirstDayOfMonth() })
            .andWhere('detail.productId = product.id');
    }, 'orderCount')
        .innerJoinAndSelect('product.category', 'category')
        .orderBy('orderCount', 'DESC')
        .addOrderBy('product.id', 'DESC');
}
class HomeController {
    HomePage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.menuActive = menuActive.HomePage;
                res.locals.title = 'Trang chủ';
                const popularCategoryList = yield models_1.default.createQueryBuilder(models_1.Category, 'category')
                    .addSelect((qb) => {
                    return qb
                        .select('count(*)')
                        .from(models_1.OrderDetail, 'detail')
                        .innerJoin('detail.order', 'order')
                        .innerJoin('detail.product', 'product')
                        .where('order.orderDate >= :date', { date: GetFirstDayOfMonth() })
                        .andWhere('product.categoryId = category.id');
                }, 'orderCount')
                    .orderBy('orderCount', 'DESC')
                    .addOrderBy('category.id', 'DESC')
                    .take(6)
                    .getMany();
                const popularProducts = yield QbPopularProduct().getMany();
                const latestProducts = yield models_1.default.createQueryBuilder(models_1.Product, 'product').innerJoinAndSelect('product.category', 'category').orderBy('product.id', 'DESC').getMany();
                return res.render('index', { popularCategoryList, popularProducts, latestProducts });
            }
            catch (error) {
                next(error);
            }
        });
    }
    GetDataForHomeLayout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.categoryGroupList = yield models_1.default.createQueryBuilder(models_1.CategoryGroup, 'group').innerJoinAndSelect('group.categories', 'category').getMany();
                return next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    ProductList(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.menuActive = menuActive.ProductList;
                res.locals.title = 'Danh sách sản phẩm';
                const q = ((_a = req.query.q) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                const productQb = QbPopularProduct().where('product.name LIKE :q', { q: `%${q}%` });
                const category = yield models_1.default.manager.findOneBy(models_1.Category, {
                    id: parseInt(req.params.categoryId),
                });
                if (category)
                    productQb.where('category.id = :categoryId', { categoryId: category.id });
                const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
                const productPerPage = 12;
                const [productList, totalProduct] = yield Promise.all([
                    yield productQb
                        .skip((page - 1) * productPerPage)
                        .take(productPerPage)
                        .getMany(),
                    yield productQb.getCount(),
                ]);
                const productData = {
                    category,
                    q,
                    page,
                    productPerPage,
                    totalProduct,
                    productList,
                };
                return res.render('productList', { productData });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ProductDetails(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.menuActive = menuActive.ProductList;
                res.locals.title = 'Chi tiết sản phẩm';
                const productInfo = yield models_1.default.createQueryBuilder(models_1.Product, 'product')
                    .innerJoinAndSelect('product.category', 'category')
                    .leftJoinAndSelect('product.images', 'images')
                    .where('product.id = :id', { id: req.params.id })
                    .getOne();
                const suggestProducts = yield QbPopularProduct()
                    .where('product.id != :id', { id: productInfo === null || productInfo === void 0 ? void 0 : productInfo.id })
                    .andWhere('category.id = :categoryId', { categoryId: (_a = productInfo === null || productInfo === void 0 ? void 0 : productInfo.category) === null || _a === void 0 ? void 0 : _a.id })
                    .take(10)
                    .getMany();
                return res.render('productDetails', { productInfo, suggestProducts });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Wishlist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.title = 'Danh sách yêu thích';
                return res.render('profile/wishlist');
            }
            catch (error) {
                next(error);
            }
        });
    }
    Cart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.title = 'Giỏ hàng';
                return res.render('profile/cart');
            }
            catch (error) {
                next(error);
            }
        });
    }
    Checkout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.title = 'Đặt hàng';
                const curUser = yield models_1.default.manager.findOne(models_1.User, {
                    relations: { cart: { product: true } },
                    where: { id: Number(res.locals.curUser.id) },
                });
                if ((curUser === null || curUser === void 0 ? void 0 : curUser.cart.length) === 0)
                    return res.redirect('/profile/cart');
                return res.render('profile/checkout', { curUser });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Profile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.locals.title = 'Tài khoản của tôi';
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                const curUser = yield models_1.default.manager.findOne(models_1.User, {
                    relations: { order: true },
                    where: { id: Number(res.locals.curUser.id) },
                });
                if (curUser && req.method === 'POST') {
                    const { oldPass, newPass, retypePass } = req.body;
                    const pass = crypto_1.default.createHash('sha256').update(oldPass).digest('base64');
                    if (oldPass !== '' || newPass !== '') {
                        if (curUser.password !== pass)
                            res.locals.errors.push({ msg: 'Mật khẩu hiện tại không chính xác' });
                        if (newPass.length < 3)
                            res.locals.errors.push({ msg: 'Mật khẩu mới phải từ 3 ký tự trở lên' });
                        if (newPass !== retypePass)
                            res.locals.errors.push({ msg: 'Mật khẩu nhập lại không đúng' });
                    }
                    if (res.locals.errors.length === 0) {
                        models_1.default.getRepository(models_1.User).merge(curUser, req.body);
                        curUser.password = crypto_1.default.createHash('sha256').update(newPass).digest('base64');
                        const rs = yield models_1.default.getRepository(models_1.User).save(curUser);
                        if (rs)
                            return res.render('partials/redirect', { msg: 'Cập nhật thông tin thành công', redirect: '/profile' });
                    }
                }
                return res.render('profile/index', { curUser, orderStatusForDisplay: ConstData_1.orderStatusForDisplay, userGendersForDisplay: ConstData_1.userGendersForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new HomeController();
