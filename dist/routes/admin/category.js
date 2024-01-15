"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = __importDefault(require("../../controllers/CategoryController"));
const upload_1 = __importDefault(require("../../middleware/upload"));
const validate_1 = require("../../middleware/validate");
const router = express_1.default.Router();
router.get('/', CategoryController_1.default.GetAll);
router.get('/create', CategoryController_1.default.Create);
router.post('/create', upload_1.default.single('img'), validate_1.validateCategory, CategoryController_1.default.Create);
router.get('/details/:id', CategoryController_1.default.Details);
router.get('/edit/:id', CategoryController_1.default.Edit);
router.post('/edit/:id', upload_1.default.single('img'), validate_1.validateCategory, CategoryController_1.default.Edit);
router.post('/delete/:id', CategoryController_1.default.Delete);
exports.default = router;
