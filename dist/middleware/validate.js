"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategoryGroup = exports.validateCategory = exports.validateProduct = exports.validateEditUser = exports.validateCreateUser = exports.validateLogin = void 0;
const express_validator_1 = require("express-validator");
exports.validateLogin = [(0, express_validator_1.body)('username', 'Tài khoản không được để trống').trim().notEmpty(), (0, express_validator_1.body)('password', 'Mật khẩu không được để trống').trim().notEmpty()];
exports.validateCreateUser = [
    (0, express_validator_1.body)('fullName', 'Tên không được để trống').trim().notEmpty(),
    (0, express_validator_1.body)('username', 'Tài khoản phải từ 5 ký tự trở lên').isLength({ min: 5 }),
    (0, express_validator_1.body)('password', 'Mật khẩu phải từ 3 ký tự trở lên').isLength({ min: 3 }),
    (0, express_validator_1.body)('email', 'Email không được để trống').trim().notEmpty(),
    (0, express_validator_1.body)('email', 'Email không hợp lệ').isEmail(),
    (0, express_validator_1.body)('phoneNumber', 'Số điện thoại không hợp lệ').isMobilePhone('vi-VN'),
    (0, express_validator_1.body)('DoB', 'Ngày sinh không hợp lệ').isISO8601().toDate(),
    (0, express_validator_1.body)('address', 'Địa chỉ không được để trống').trim().notEmpty(),
];
exports.validateEditUser = [
    (0, express_validator_1.body)('fullName', 'Tên không được để trống').trim().notEmpty(),
    (0, express_validator_1.body)('email', 'Email không được để trống').trim().notEmpty(),
    (0, express_validator_1.body)('email', 'Email không hợp lệ').isEmail(),
    (0, express_validator_1.body)('phoneNumber', 'Số điện thoại không hợp lệ').isMobilePhone('vi-VN'),
    (0, express_validator_1.body)('DoB', 'Ngày sinh không hợp lệ').isISO8601().toDate(),
    (0, express_validator_1.body)('address', 'Địa chỉ không được để trống').trim().notEmpty(),
];
exports.validateProduct = [
    (0, express_validator_1.body)('name', 'Tên sản phẩm không được để trống').trim().notEmpty(),
    (0, express_validator_1.body)('price', 'Giá phải lớn hơn 0').isInt({ min: 0 }),
    (0, express_validator_1.body)('discount', 'Giảm giá phải từ 0-100 %').isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('amount', 'Số lượng tồn phải lớn hơn 0').isInt({ min: 0 }),
];
exports.validateCategory = (0, express_validator_1.body)('name', 'Tên danh mục không được để trống').trim().notEmpty();
exports.validateCategoryGroup = (0, express_validator_1.body)('name', 'Tên nhóm danh mục không được để trống').trim().notEmpty();
