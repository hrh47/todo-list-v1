const express = require('express');
const router = express.Router();

const Todo = require('../models/Todo').Todo;
const checkLogin = require('../middlewares/check').checkLogin;

// GET /todos
router.get('/', checkLogin, function(req, res, next) {
  Todo
    .find({author: req.session.user._id})
    .sort({_id: 1})
    .exec()
    .then(function(todos) {
      res.render('index', {
        todos: todos
      });
    })
    .catch(next);
});

// POST /todos
router.post('/', checkLogin, function(req, res, next) {
  const body = req.body.body;
  try {
    if (!body) {
      throw new Error('待辦事項不能為空');
    }
  } catch(e) {
    return res.send({status: 'error', message: e.message});
  }

  let todo = {
    author: req.session.user._id,
    body: body
  };

  Todo
    .insertOne(todo)
    .exec()
    .then(function(result) {
      todo = result.ops[0];
      delete todo.author;
      res.send({status: 'ok', todo: todo});
    })
    .catch(next);
});

// PATCH /todos/:id
router.patch('/:id', checkLogin, function(req, res, next) {
  const todoId = req.params.id;
  const user = req.session.user;

  Todo
    .findOne({_id: todoId})
    .populate({path: 'author', model: 'User'})
    .exec()
    .then(function(todo) {
      if (!todo || todo.author._id.toString() !== user._id.toString()) {
        return res.send({status: 'error', message: '權限不足'});
      }
      const successMessage = req.body.body ? '待辦事項已更新' : '狀態已更新';
      let data = {
        body: req.body.body || todo.body,
      };
      if (req.body.isDone) {
        data.isDone = req.body.isDone === 'true' ? true : false;
      } else {
        data.isDone = todo.isDone;
      }
      Todo
        .updateOne({_id: todoId}, {$set: data})
        .exec()
        .then(function() {
          res.send({status: 'ok', message: successMessage});
        })
        .catch(next);
    })
    .catch(next);
});

// DELETE /todos/:id
router.delete('/:id', checkLogin, function(req, res, next) {
  const todoId = req.params.id;
  const user = req.session.user;
  Todo
    .findOne({_id: todoId})
    .populate({path: 'author', model: 'User'})
    .exec()
    .then(function(todo) {
      if (!todo || todo.author._id.toString() !== user._id.toString()) {
        return res.send({status: 'error', message: '權限不足'});
      }
      Todo
        .deleteOne({_id: todoId})
        .exec()
        .then(function(result) {
          if (result.result.n && result.result.ok) {
            res.send({status: 'ok', message: '待辦事項已刪除'});
          } else {
            res.send({status: 'error', message: '出錯了...'});
          }
        })
        .catch(next);
    })
    .catch(next);
});

router.delete('/', checkLogin, function(req, res, next) {
  const user = req.session.user;
  Todo
    .deleteMany({author: user._id, isDone: true})
    .exec()
    .then(function(result) {
      if (result.result.ok) {
        res.send({status: 'ok', message: '清除已完成的待辦事項'});
      } else {
        res.send({status: 'error', message: '出錯了...'});
      }
    })
    .catch(next);
});

module.exports = router;
