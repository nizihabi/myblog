let path = require('path');
let sha1 = require('sha1');
let express = require('express');
let router = express.Router();

let checkNotLogin = require('../middlewares/check').checkNotLogin;

let UserModel = require('../models/users');

// GET /signup 注册页
router.get('/', checkNotLogin, (req, res, next) => {

    res.render("signup");
});

// POST /signup 用户注册
router.post('/', checkNotLogin, (req, res, next) => {
    let name = req.fields.name;
    let gender = req.fields.gender;
    let bio = req.fields.bio;
    let avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;
    let repassword = req.fields.repassword;

    try {
        if (!(name.length >= 1 && name.length <= 10)) {

            throw new Error('名字限定于1到10个字符');
        }

        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (!req.files.avatar.name) {
            throw new Error('缺少头像');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    password = sha1(password);

    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    };

    UserModel.create(user)
        .then((result) => {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            req.session.user = user;
            // 写入 flash
            req.flash('success', '注册成功');
            // 跳转到首页
            res.redirect('/posts');
        })
        .catch((e) => {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('/signup');
            }
            next(e);
        })

});

module.exports = router;