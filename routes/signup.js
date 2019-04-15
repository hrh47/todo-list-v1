const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User').User;
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup
router.get('/', checkNotLogin, function(req, res) {
  res.render('signup');
});

// POST /signup
router.post('/', checkNotLogin, function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const repassword = req.body.repassword;
  try {
    if (!username) {
      throw new Error('請輸入帳號');
    }
    if (!password) {
      throw new Error('請輸入密碼');
    }
    if (password !== repassword) {
      throw new Error('兩次輸入的密碼不一致');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('/signup');
  }
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds)
    .then(function(passwordHash) {
      User.insertOne({
        username: username,
        password: passwordHash
      })
      .exec()
      .then(function(result) {
        req.flash('success', '註冊成功');
        res.redirect('/signin');
      })
      .catch(function(e) {
        if (e.message.match('duplicate key')) {
          req.flash('error', '這個帳號已經有人使用');
          return res.redirect('/signup');
        }
        next();
      });
    });
});

module.exports = router;
