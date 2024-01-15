"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
const home_1 = __importDefault(require("./routes/home"));
const profile_1 = __importDefault(require("./routes/profile"));
const admin_1 = __importDefault(require("./routes/admin"));
const api_1 = __importDefault(require("./routes/api"));
const UserController_1 = __importDefault(require("./controllers/UserController"));
const models_1 = __importDefault(require("./models"));
models_1.default.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
})
    .catch((err) => {
    console.error('Error during Data Source initialization:', err);
});
const port = process.env.SERVER_PORT;
const app = (0, express_1.default)();
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({ secret: process.env.SECRET_KEY || 'secret', cookie: { maxAge: 24 * 60 * 60 * 1000 }, resave: false, saveUninitialized: true }));
app.use(UserController_1.default.Authenticate);
app.use('/', home_1.default);
app.use('/profile', profile_1.default);
app.use('/admin', admin_1.default);
app.use('/api', api_1.default);
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404, 'Page not found'));
});
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.status = err.status;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).render('error');
});
app.listen(port, function () {
    console.log(`Server is listening on http://localhost:${port}`);
});
