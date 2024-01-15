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
class CategoryGroupController {
    GetAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groupList = yield CategoryGroupRepository.find();
                return res.render('admin/categoryGroup/index', { groupList });
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
                    const group = CategoryGroupRepository.create({
                        name: req.body.name,
                        img: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || '',
                    });
                    const rs = yield CategoryGroupRepository.save(group);
                    if (rs)
                        res.locals.createSuccess = true;
                }
                res.render('admin/categoryGroup/create');
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
                const group = yield CategoryGroupRepository.findOneBy({ id: parseInt(req.params.id) });
                if (group) {
                    if (req.method === 'POST' && errors.isEmpty()) {
                        group.name = req.body.name;
                        group.img = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || group.img;
                        const rs = yield CategoryGroupRepository.save(group);
                        if (rs)
                            res.locals.editSuccess = true;
                    }
                    res.locals.groupInfo = group;
                }
                res.render('admin/categoryGroup/edit');
            }
            catch (error) {
                next(error);
            }
        });
    }
    Details(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const groupInfo = yield CategoryGroupRepository.findOne({
                    where: { id: parseInt(req.params.id) },
                });
                res.render('admin/categoryGroup/details', { groupInfo });
            }
            catch (error) {
                next(error);
            }
        });
    }
    Delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rs = yield CategoryGroupRepository.delete(req.params.id);
                res.json({
                    message: rs.affected === 0 ? 'Lỗi xoá nhóm danh mục' : 'Xoá nhóm danh mục thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CategoryGroupController();
