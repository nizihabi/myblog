let express = require('express');
let router = express.Router();

let checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', checkLogin, (req, res, next) => {
    //清空session 中user的信息
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/posts');
});

module.exports = router;