const mongolass = require('../lib/mongo').mongolass;

exports.User = mongolass.model('User', {
  username: {type: 'string', required: true},
  password: {type: 'string', required: true}
});
exports.User.createIndex({username: 1}, {unique: true}).exec();
