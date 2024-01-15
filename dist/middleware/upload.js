"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const dest = path_1.default.join(__dirname, '../public/images/upload');
        fs_extra_1.default.mkdirp(dest, function (err) {
            if (err)
                cb(err, dest);
            else
                cb(null, dest);
        });
    },
    filename: function (req, file, cb) {
        const filePath = path_1.default.parse(file.originalname);
        cb(null, filePath.name + '-' + Date.now() + filePath.ext);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
