const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// POST /signout
router.post('/', checkLogin, function(req, res) {
  req.session.user = null;
  res.send({status: 'ok', message: '登出成功'});
});

module.exports = router;
