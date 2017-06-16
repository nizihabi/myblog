"use strict"

let path = require('path');
let express = require('express');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let flash = require('connect-flash');
let config = require('config-lite')(__dirname);
let routes = require('./routes');
let pkg = require('./package');

let app = express();

//设置模板目录
app.set("views", path.join(__dirname, "views"));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

//设置资源目录
app.use(express.static(path.join(__dirname, "public")));

//session 中间件
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    cookie: {
        maxAge: config.session.maxAge,
    },
    store: new MongoStore({
        url: config.mongodb
    })
}));

// flash 中间价，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
    keepExtensions: true // 保留后缀
}));

app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});
// 路由
routes(app);

// 监听端口，启动程序
app.listen(config.port, () => {
    console.log(`${pkg.name} listening on port ${config.port}`);
});