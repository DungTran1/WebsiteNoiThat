"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../../controllers/UserController"));
const router = express_1.default.Router();
router.get('/user-info', UserController_1.default.UserInfo);
router.post('/add-wishlist', UserController_1.default.AddToWishlist);
router.post('/remove-wishlist', UserController_1.default.RemoveFromWishlist);
router.post('/add-cart', UserController_1.default.AddToCart);
router.post('/remove-cart', UserController_1.default.RemoveFromCart);
router.use(function (req, res, next) {
    res.status(404).json('API not found');
});
router.use(function (err, req, res, next) {
    res.status(500).json(err.message);
});
exports.default = router;
