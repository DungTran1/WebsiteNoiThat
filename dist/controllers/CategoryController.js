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
const CategoryGroupRepository = models_1.default.getRepository(models_1.CategoryGroup);
const CategoryRepository = models_1.default.getRepository(models_1.Category);
class CategoryController {
    GetAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cateList = yield CategoryRepository.find({ relations: { categoryGroup: true } });
                return res.render('admin/category/index', { cateList });
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
                    const group = yield CategoryGroupRepository.findOneBy({ id: parseInt(req.body.groupId) });
                    const cate = CategoryRepository.create({
                        name: req.body.name,
                        img: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || '',
                        categoryGroup: group,
                    });
                    const rs = yield CategoryRepository.save(cate);
                    if (rs)
                        res.locals.createSuccess = true;
                }
                const cateGroups = yield CategoryGroupRepository.find();
                res.render('admin/category/create', { cateGroups });
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
                const cate = yield CategoryRepository.findOne({
                    relations: { categoryGroup: true },
                    where: { id: parseInt(req.params.id) },
                });
                if (cate) {
                    if (req.method === 'POST' && errors.isEmpty()) {
                        const group = yield CategoryGroupRepository.findOneBy({
                            id: parseInt(req.body.groupId),
                        });
                        cate.name = req.body.name;
                        cate.img = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || cate.img;
                        cate.categoryGroup = group;
                        const rs = yield CategoryRepository.save(cate);
                        if (rs)
                            res.locals.editSuccess = true;
                    }
                    res.locals.cateInfo = cate;
                }
                const cateGroups = yield CategoryGroupRepository.find();
                res.render('admin/category/edit', { cateGroups });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Details(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cateInfo = yield CategoryRepository.findOne({
                    relations: { categoryGroup: true },
                    where: { id: parseInt(req.params.id) },
                });
                res.render('admin/category/details', { cateInfo });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rs = yield CategoryRepository.delete(req.params.id);
                res.json({ message: rs.affected === 0 ? 'Lỗi xoá danh mục' : 'Xoá danh mục thành công' });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CategoryController();
