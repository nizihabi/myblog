'use strict'
let sha1 = require('sha1');
let express = require('express');
let router = express.Router();

let checkNotLogin = require('../middlewares/check').checkNotLogin;
let UserModel = require('../models/users');
// GET /signin 登录页
router.get('/', checkNotLogin, (req, res, next) => {
    res.render('signin');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, (req, res, next) => {
    let name = req.fields.name;
    let password = req.fields.password;
    UserModel.getUserByName(name)
        .then((user) => {
            if (!user) {
                req.flash('error', '用户名不存在');
                return res.redirect('back');
            }
            if (sha1(password) !== user.password) {
                req.flash('error', '用户名或密码错误');
                return res.redirect('back');
            }
            req.flash('success', `登录成功, 注册时间: ${user.created_at}`);
    
            delete user.password;
            req.session.user = user;
            res.redirect('/posts');
        })
        .catch(next)

});

module.exports = router;