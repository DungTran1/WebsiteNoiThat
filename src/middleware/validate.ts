import { body } from 'express-validator'

export const validateLogin = [body('username', 'Tài khoản không được để trống').trim().notEmpty(), body('password', 'Mật khẩu không được để trống').trim().notEmpty()]

export const validateCreateUser = [
    body('fullName', 'Tên không được để trống').trim().notEmpty(),
    body('username', 'Tài khoản phải từ 5 ký tự trở lên').isLength({ min: 5 }),
    body('password', 'Mật khẩu phải từ 3 ký tự trở lên').isLength({ min: 3 }),
    body('email', 'Email không được để trống').trim().notEmpty(),
    body('email', 'Email không hợp lệ').isEmail(),
    body('phoneNumber', 'Số điện thoại không hợp lệ').isMobilePhone('vi-VN'),
    body('DoB', 'Ngày sinh không hợp lệ').isISO8601().toDate(),
    body('address', 'Địa chỉ không được để trống').trim().notEmpty(),
]

export const validateEditUser = [
    body('fullName', 'Tên không được để trống').trim().notEmpty(),
    body('email', 'Email không được để trống').trim().notEmpty(),
    body('email', 'Email không hợp lệ').isEmail(),
    body('phoneNumber', 'Số điện thoại không hợp lệ').isMobilePhone('vi-VN'),
    body('DoB', 'Ngày sinh không hợp lệ').isISO8601().toDate(),
    body('address', 'Địa chỉ không được để trống').trim().notEmpty(),
]

export const validateProduct = [
    body('name', 'Tên sản phẩm không được để trống').trim().notEmpty(),
    body('price', 'Giá phải lớn hơn 0').isInt({ min: 0 }),
    body('discount', 'Giảm giá phải từ 0-100 %').isInt({ min: 0, max: 100 }),
    body('amount', 'Số lượng tồn phải lớn hơn 0').isInt({ min: 0 }),
]

export const validateCategory = body('name', 'Tên danh mục không được để trống').trim().notEmpty()

export const validateCategoryGroup = body('name', 'Tên nhóm danh mục không được để trống').trim().notEmpty()
