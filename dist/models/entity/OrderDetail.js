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
const Order_1 = __importDefault(require("./Order"));
const Product_1 = __importDefault(require("./Product"));
let OrderDetail = class OrderDetail {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], OrderDetail.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], OrderDetail.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.default, (order) => order.details, { onDelete: 'CASCADE' }),
    __metadata("design:type", Order_1.default)
], OrderDetail.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.default, (product) => product.orderDetail, { onDelete: 'SET NULL' }),
    __metadata("design:type", Product_1.default)
], OrderDetail.prototype, "product", void 0);
OrderDetail = __decorate([
    (0, typeorm_1.Entity)()
], OrderDetail);
exports.default = OrderDetail;
