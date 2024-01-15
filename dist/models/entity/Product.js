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
const Cart_1 = __importDefault(require("./Cart"));
const Category_1 = __importDefault(require("./Category"));
const OrderDetail_1 = __importDefault(require("./OrderDetail"));
const ProductImage_1 = __importDefault(require("./ProductImage"));
const User_1 = __importDefault(require("./User"));
let Product = class Product {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "img", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 4000 }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "origin", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('tinyint'),
    __metadata("design:type", Number)
], Product.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Product.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category_1.default, (cate) => cate.products, {
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", Object)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductImage_1.default, (image) => image.product),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.default, (user) => user.wishlist, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Product.prototype, "wishlist", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Cart_1.default, (cart) => cart.product),
    __metadata("design:type", Array)
], Product.prototype, "cart", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderDetail_1.default, (order) => order.product),
    __metadata("design:type", Array)
], Product.prototype, "orderDetail", void 0);
Product = __decorate([
    (0, typeorm_1.Entity)()
], Product);
exports.default = Product;
