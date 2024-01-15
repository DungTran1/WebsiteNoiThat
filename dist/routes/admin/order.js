"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrderController_1 = __importDefault(require("../../controllers/OrderController"));
const router = express_1.default.Router();
router.get('/', OrderController_1.default.Index);
router.get('/details/:id', OrderController_1.default.Details);
router.get('/edit/:id', OrderController_1.default.Edit);
router.post('/edit/:id', OrderController_1.default.Edit);
router.post('/set-status/:id', OrderController_1.default.SetOrderStatus);
router.post('/delete/:id', OrderController_1.default.Delete);
exports.default = router;
