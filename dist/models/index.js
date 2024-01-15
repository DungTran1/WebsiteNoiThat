"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDetail = exports.Order = exports.Cart = exports.CategoryGroup = exports.ProductImage = exports.Product = exports.Category = exports.User = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("./entity/User"));
exports.User = User_1.default;
const Category_1 = __importDefault(require("./entity/Category"));
exports.Category = Category_1.default;
const CategoryGroup_1 = __importDefault(require("./entity/CategoryGroup"));
exports.CategoryGroup = CategoryGroup_1.default;
const Product_1 = __importDefault(require("./entity/Product"));
exports.Product = Product_1.default;
const ProductImage_1 = __importDefault(require("./entity/ProductImage"));
exports.ProductImage = ProductImage_1.default;
const Cart_1 = __importDefault(require("./entity/Cart"));
exports.Cart = Cart_1.default;
const Order_1 = __importDefault(require("./entity/Order"));
exports.Order = Order_1.default;
const OrderDetail_1 = __importDefault(require("./entity/OrderDetail"));
exports.OrderDetail = OrderDetail_1.default;
const AppDataSource = new typeorm_1.DataSource({
    type: 'mssql',
    host: 'localhost',
    username: 'sa',
    password: 'khongthe01',
    database: 'WebsiteNoiThat',
    synchronize: true,
    logging: false,
    entities: [User_1.default, Category_1.default, Product_1.default, ProductImage_1.default, CategoryGroup_1.default, Cart_1.default, Order_1.default, OrderDetail_1.default],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: false,
    },
});
exports.default = AppDataSource;
