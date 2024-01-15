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
const OrderDetail_1 = __importDefault(require("./OrderDetail"));
const User_1 = __importDefault(require("./User"));
let Order = class Order {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { default: Date.now() }),
    __metadata("design:type", Date)
], Order.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 255 }),
    __metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 4000 }),
    __metadata("design:type", String)
], Order.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Order.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('bit', { default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isPaid", void 0);
__decorate([
    (0, typeorm_1.Column)('tinyint', { default: 1 }),
    __metadata("design:type", Number)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.default, (user) => user.order, { onDelete: 'SET NULL' }),
    __metadata("design:type", User_1.default)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderDetail_1.default, (detail) => detail.order),
    __metadata("design:type", Array)
], Order.prototype, "details", void 0);
Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
exports.default = Order;
