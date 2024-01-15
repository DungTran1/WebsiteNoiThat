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
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const typeorm_1 = require("typeorm");
const models_1 = __importStar(require("../models"));
const ConstData_1 = require("./ConstData");
const UserRepository = models_1.default.getRepository(models_1.User);
class UserController {
    GetAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userList = yield UserRepository.find();
                return res.render('admin/user/index', { userList, userRolesForDisplay: ConstData_1.userRolesForDisplay, userGendersForDisplay: ConstData_1.userGendersForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                if (req.method === 'POST' && errors.isEmpty()) {
                    const exist = yield UserRepository.exist({ where: { username: req.body.username } });
                    if (exist) {
                        res.locals.errors.push({ msg: 'Tài khoản đã tồn tại', param: 'username' });
                    }
                    if (res.locals.errors.length === 0) {
                        const user = yield UserRepository.create(req.body);
                        user.password = crypto_1.default.createHash('sha256').update(user.password).digest('base64');
                        const rs = yield UserRepository.save(user);
                        if (rs)
                            res.locals.createSuccess = true;
                    }
                }
                return res.render('admin/user/create', { userRolesForDisplay: ConstData_1.userRolesForDisplay, userGendersForDisplay: ConstData_1.userGendersForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Edit(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                const user = yield UserRepository.findOneBy({ id: parseInt(req.params.id) });
                if (user) {
                    if (req.method === 'POST' && errors.isEmpty()) {
                        UserRepository.merge(user, req.body);
                        const rs = yield UserRepository.save(user);
                        if (rs)
                            res.locals.editSuccess = true;
                    }
                    res.locals.userInfo = user;
                }
                return res.render('admin/user/edit', { userRolesForDisplay: ConstData_1.userRolesForDisplay, userGendersForDisplay: ConstData_1.userGendersForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Resetpass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserRepository.findOneBy({ id: parseInt(req.params.id) });
                let rs = null;
                if (user) {
                    user.password = crypto_1.default.createHash('sha256').update('123').digest('base64');
                    rs = yield UserRepository.save(user);
                }
                res.json({ message: rs ? 'Đã cập nhật mật khẩu' : 'Cập nhật lỗi' });
            }
            catch (error) {
                res.json({ message: 'Lỗi đặt lại mật khẩu' });
            }
        });
    }
    Changepass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.body.newPass !== req.body.retypePass)
                    return res.json('Mật khẩu nhập lại không đúng');
                const user = yield UserRepository.findOneBy({
                    id: parseInt(req.params.id),
                    password: crypto_1.default.createHash('sha256').update(req.body.oldPass).digest('base64'),
                });
                if (user) {
                    user.password = crypto_1.default.createHash('sha256').update(req.body.newPass).digest('base64');
                    yield UserRepository.save(user);
                    res.json('Đổi mật khẩu thành công');
                }
                else {
                    res.json('Mật khẩu hiện tại không chính xác');
                }
            }
            catch (error) {
                res.json('Lỗi đổi mật khẩu');
            }
        });
    }
    Details(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserRepository.findOneBy({ id: parseInt(req.params.id) });
                return res.render('admin/user/details', { userInfo: user, userRolesForDisplay: ConstData_1.userRolesForDisplay, userGendersForDisplay: ConstData_1.userGendersForDisplay });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rs = yield UserRepository.delete(req.params.id);
                res.json({ message: rs.affected === 0 ? 'Lỗi xoá người dùng' : 'Xoá người dùng thành công' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    AdminLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                if (req.method === 'POST' && errors.isEmpty()) {
                    const password = crypto_1.default.createHash('sha256').update(req.body.password).digest('base64');
                    const user = yield UserRepository.findOneBy({
                        username: req.body.username,
                        password,
                        role: (0, typeorm_1.In)([ConstData_1.UserRoles.Admin, ConstData_1.UserRoles.Manager]),
                    });
                    if (user) {
                        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY || 'secret', { expiresIn: '1d' });
                        const cookieExpires = req.body.rememberPass === 'on' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;
                        res.cookie('token', token, { expires: cookieExpires });
                        return res.redirect('/admin');
                    }
                    else
                        res.locals.errors.push({ msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác!' });
                }
                return res.render('admin/login');
            }
            catch (error) {
                next(error);
            }
        });
    }
    CustomerLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.loginErrors = errors.array();
                if (req.method === 'POST' && errors.isEmpty()) {
                    const password = crypto_1.default.createHash('sha256').update(req.body.password).digest('base64');
                    const user = yield UserRepository.findOneBy({
                        username: req.body.username,
                        password,
                        role: (0, typeorm_1.In)([ConstData_1.UserRoles.Admin, ConstData_1.UserRoles.Manager, ConstData_1.UserRoles.Customer]),
                    });
                    if (user) {
                        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY || 'secret', { expiresIn: '1d' });
                        const cookieExpires = req.body.rememberPass === 'on' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;
                        res.cookie('token', token, { expires: cookieExpires });
                        return res.redirect('/');
                    }
                    else
                        res.locals.loginErrors.push({ msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác!' });
                }
                return res.render('profile/login', { userGendersForDisplay: ConstData_1.userGendersForDisplay, page: 'login' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    CustomerRegister(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.registerErrors = errors.array();
                if (errors.isEmpty()) {
                    const exist = yield UserRepository.exist({ where: { username: req.body.username } });
                    if (exist)
                        res.locals.registerErrors.push({ msg: 'Tài khoản đã tồn tại', param: 'username' });
                    if (res.locals.registerErrors.length === 0) {
                        const user = yield UserRepository.create(req.body);
                        user.password = crypto_1.default.createHash('sha256').update(user.password).digest('base64');
                        const rs = yield UserRepository.save(user);
                        if (rs)
                            res.locals.createSuccess = true;
                    }
                }
                return res.render('profile/login', { userGendersForDisplay: ConstData_1.userGendersForDisplay, page: 'register' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Authenticate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = jsonwebtoken_1.default.verify(req.cookies.token, process.env.SECRET_KEY || 'secret');
                const curUser = yield UserRepository.findOneBy({ id: token.id });
                if (curUser)
                    res.locals.curUser = curUser;
                next();
            }
            catch (error) {
                next();
            }
        });
    }
    CheckRole(roles, redirectUrl) {
        return function (req, res, next) {
            if (res.locals.curUser && roles.includes(res.locals.curUser.role)) {
                return next();
            }
            return res.redirect(redirectUrl);
        };
    }
    UserInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json(null);
                const curUser = yield UserRepository.findOne({
                    relations: { wishlist: true, cart: { product: true } },
                    where: { id: res.locals.curUser.id },
                });
                res.json(curUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
    AddToWishlist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json('Bạn chưa đăng nhập !');
                const curUser = yield UserRepository.findOne({
                    relations: { wishlist: true },
                    where: { id: Number(res.locals.curUser.id) },
                });
                const product = yield models_1.default.manager.findOneBy(models_1.Product, {
                    id: Number(req.body.productId),
                });
                if (curUser && product) {
                    if (!curUser.wishlist.some((item) => item.id === product.id)) {
                        curUser.wishlist.push(product);
                        yield UserRepository.save(curUser);
                    }
                    return res.json('Đã thêm sản phẩm vào danh sách yêu thích');
                }
                res.json('Lỗi thêm sản phẩm');
            }
            catch (error) {
                next(error);
            }
        });
    }
    RemoveFromWishlist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json({ err: 'Bạn chưa đăng nhập !' });
                const curUser = yield UserRepository.findOne({
                    relations: { wishlist: true },
                    where: { id: Number(res.locals.curUser.id) },
                });
                const product = yield models_1.default.manager.findOneBy(models_1.Product, {
                    id: Number(req.body.productId),
                });
                if (curUser && product) {
                    curUser.wishlist = curUser.wishlist.filter((item) => item.id !== product.id);
                    yield UserRepository.save(curUser);
                    return res.json('Xoá sản phẩm khỏi DS yêu thích thành công');
                }
                return res.json({ err: 'Lỗi xoá sản phẩm khỏi DS yêu thích' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    AddToCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json('Bạn chưa đăng nhập !');
                const curUser = yield UserRepository.findOne({
                    where: { id: Number(res.locals.curUser.id) },
                });
                const product = yield models_1.default.manager.findOneBy(models_1.Product, {
                    id: Number(req.body.productId),
                });
                if (curUser && product) {
                    const cartAmount = req.body.amount;
                    if (cartAmount && cartAmount > product.amount)
                        return res.json(`Hiện sản phẩm: ${product.name} không còn đủ để đặt hàng. Còn lại ${product.amount}`);
                    const userCart = yield models_1.default.manager.findOneBy(models_1.Cart, {
                        user: { id: curUser.id },
                        product: { id: product.id },
                    });
                    if (userCart) {
                        userCart.amount = req.body.amount || 1;
                        yield models_1.default.manager.save(userCart);
                        return res.json('Đã cập nhật giỏ hàng');
                    }
                    else {
                        const cart = new models_1.Cart();
                        cart.user = curUser;
                        cart.product = product;
                        cart.amount = req.body.amount || 1;
                        yield models_1.default.manager.save(cart);
                        return res.json('Đã thêm sản phẩm vào giỏ hàng');
                    }
                }
                res.json('Lỗi thêm sản phẩm');
            }
            catch (error) {
                next(error);
            }
        });
    }
    RemoveFromCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json({ err: 'Bạn chưa đăng nhập !' });
                const curUser = yield UserRepository.findOne({
                    where: { id: Number(res.locals.curUser.id) },
                });
                const product = yield models_1.default.manager.findOneBy(models_1.Product, {
                    id: Number(req.body.productId),
                });
                if (curUser && product) {
                    const userCart = yield models_1.default.manager.findOneBy(models_1.Cart, {
                        user: { id: curUser.id },
                        product: { id: product.id },
                    });
                    if (userCart)
                        yield models_1.default.manager.remove(models_1.Cart, userCart);
                    return res.json('Xoá sản phẩm khỏi giỏ hàng thành công');
                }
                return res.json({ err: 'Lỗi xoá sản phẩm khỏi giỏ hàng' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    GetUserCartToPay(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!res.locals.curUser)
                    return res.json({ err: 'Bạn chưa đăng nhập !' });
                const curUser = yield UserRepository.findOne({
                    relations: { cart: { product: true } },
                    where: { id: Number(res.locals.curUser.id) },
                });
                res.locals.userCart =
                    (curUser === null || curUser === void 0 ? void 0 : curUser.cart.filter((item) => item.amount <= item.product.amount).map((item) => ({
                        productName: item.product.name,
                        amount: item.amount,
                        price: Math.ceil((item.product.price - (item.product.price * item.product.discount) / 100) * item.amount),
                    }))) || [];
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new UserController();
