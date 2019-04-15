const Mongolass = require('mongolass');
const mongolass = require('../lib/mongo').mongolass;

exports.Todo = mongolass.model('Todo', {
  author: {type: Mongolass.Types.ObjectId, required: true},
  body: {type: 'string', required: true},
  isDone: {type: 'boolean', required: true, default: false}
});

exports.Todo.createIndex({author: 1, _id: -1}).exec();
