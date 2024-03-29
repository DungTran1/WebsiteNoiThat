"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ProductController_1 = __importDefault(require("../../controllers/ProductController"));
const upload_1 = __importDefault(require("../../middleware/upload"));
const validate_1 = require("../../middleware/validate");
const router = express_1.default.Router();
router.get('/', ProductController_1.default.GetAll);
router.get('/create', ProductController_1.default.Create);
router.post('/create', upload_1.default.single('img'), validate_1.validateProduct, ProductController_1.default.Create);
router.get('/details/:id', ProductController_1.default.Details);
router.get('/edit/:id', ProductController_1.default.Edit);
router.post('/edit/:id', upload_1.default.single('img'), validate_1.validateProduct, ProductController_1.default.Edit);
router.get('/img-list/:id', ProductController_1.default.GetImgList);
router.post('/img-list/add/:id', upload_1.default.array('imgUpload'), ProductController_1.default.AddImg);
router.post('/img-list/delete/:idImg', ProductController_1.default.DeleteImg);
router.post('/delete/:id', ProductController_1.default.Delete);
exports.default = router;
