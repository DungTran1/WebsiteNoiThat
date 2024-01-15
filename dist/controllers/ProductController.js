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
const express_validator_1 = require("express-validator");
const models_1 = __importStar(require("../models"));
const CategoryRepository = models_1.default.getRepository(models_1.Category);
const ProductRepository = models_1.default.getRepository(models_1.Product);
const ProductImageRepository = models_1.default.getRepository(models_1.ProductImage);
class ProductController {
    GetAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productList = yield ProductRepository.find({ relations: { category: true } });
                return res.render('admin/product/index', { productList });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Create(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                if (req.method === 'POST' && errors.isEmpty()) {
                    const category = yield CategoryRepository.findOneBy({ id: parseInt(req.body.categoryId) });
                    const product = new models_1.Product();
                    ProductRepository.merge(product, req.body, {
                        img: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || '',
                        category: category || undefined,
                    });
                    const rs = yield ProductRepository.save(product);
                    if (rs)
                        res.locals.createSuccess = true;
                }
                const cateList = yield CategoryRepository.find();
                return res.render('admin/product/create', { cateList });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Edit(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                res.locals.errors = errors.array();
                const product = yield ProductRepository.findOne({
                    relations: { category: true },
                    where: { id: parseInt(req.params.id) },
                });
                if (product) {
                    if (req.method === 'POST' && errors.isEmpty()) {
                        const category = yield CategoryRepository.findOneBy({ id: req.body.categoryId });
                        ProductRepository.merge(product, req.body, {
                            img: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || product.img,
                        });
                        product.category = category;
                        const rs = yield models_1.default.getRepository(models_1.Product).save(product);
                        if (rs)
                            res.locals.editSuccess = true;
                    }
                    res.locals.productInfo = product;
                }
                const cateList = yield CategoryRepository.find();
                return res.render('admin/product/edit', { cateList });
            }
            catch (error) {
                next(error);
            }
        });
    }
    GetImgList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield ProductRepository.findOne({
                relations: { images: true },
                where: { id: parseInt(req.params.id) },
            });
            res.json((product === null || product === void 0 ? void 0 : product.images) || []);
        });
    }
    AddImg(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield ProductRepository.findOneBy({ id: parseInt(req.params.id) });
                if (req.files instanceof Array) {
                    const images = req.files.map(function (file) {
                        return { product: product, img: file.filename };
                    });
                    const productImages = ProductImageRepository.create(images);
                    yield ProductImageRepository.save(productImages);
                }
                res.json({ err: false });
            }
            catch (error) {
                res.json({ err: true });
            }
        });
    }
    DeleteImg(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rs = yield ProductImageRepository.delete(req.params.idImg);
                res.json({ err: rs.affected === 0 });
            }
            catch (error) {
                res.json({ err: true });
            }
        });
    }
    Details(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productInfo = yield ProductRepository.findOne({
                    relations: { category: true },
                    where: { id: parseInt(req.params.id) },
                });
                return res.render('admin/product/details', { productInfo });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rs = yield ProductRepository.delete(req.params.id);
                res.json({ message: rs.affected === 0 ? 'Lỗi xoá sản phẩm' : 'Xoá sản phẩm thành công' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new ProductController();
