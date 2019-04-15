const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const User = require('../models/User').User;
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin
router.get('/', checkNotLogin, function(req, res) {
  res.render('signin');
});

// POST /signin
router.post('/', checkNotLogin, function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    if (!username) {
      throw new Error('請輸入帳號');
    }
    if (!password) {
      throw new Error('請輸入密碼');
    }
  } catch(e) {
    req.flash('error', e.message);
    return res.redirect('/signin');
  }

  User
    .findOne({username: username})
    .exec()
    .then(function(user) {
      if (!user) {
        req.flash('error', '帳號或密碼錯誤');
        return res.redirect('/signin');
      }
      bcrypt.compare(password, user.password)
        .then(function(result) {
          if (result === false) {
            req.flash('error', '帳號或密碼錯誤');
            return res.redirect('/signin');
          }
          delete user.password;
          req.session.user = user;
          res.redirect('/todos');
        });
    })
    .catch(next);
});

module.exports = router;
