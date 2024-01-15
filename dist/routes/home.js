"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const HomeController_1 = __importDefault(require("../controllers/HomeController"));
const router = express_1.default.Router();
router.use(HomeController_1.default.GetDataForHomeLayout);
router.get('/', HomeController_1.default.HomePage);
router.get('/product-list/:categoryId?', HomeController_1.default.ProductList);
router.get('/product/:id', HomeController_1.default.ProductDetails);
exports.default = router;
