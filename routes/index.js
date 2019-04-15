/*

  1. 註冊
    i. 註冊頁： GET /signup
    ii. 註冊： POST /signup
  2. 登入
    i. 登入頁： GET /signin
    ii. 登入： POST /signin
  3. 登出： POST /signout
  4. 查看 todo list： GET / 或 GET /todos
  5. 新增 todo： POST /todos
  6. 修改 todo： PATCH /todos/:id
  7. 刪除 todo： DELETE /todos/:id
  8. 刪除已完成 todo： DELETE /todos

*/

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.redirect('/todos');
  });
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/todos', require('./todos'));
}
