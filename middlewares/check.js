module.exports = {
  checkLogin: function(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登入');
      return res.redirect('/signin');
    }
    next();
  },
  checkNotLogin: function(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登入');
      return res.redirect('back');
    }
    next();
  }
}
