"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const CategoryGroup_1 = __importDefault(require("./CategoryGroup"));
const Product_1 = __importDefault(require("./Product"));
let Category = class Category {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 50 }),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], Category.prototype, "img", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CategoryGroup_1.default, (cate) => cate.categories, {
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", Object)
], Category.prototype, "categoryGroup", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product_1.default, (prod) => prod.category),
    __metadata("design:type", Array)
], Category.prototype, "products", void 0);
Category = __decorate([
    (0, typeorm_1.Entity)()
], Category);
exports.default = Category;
