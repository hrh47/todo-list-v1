require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  session: {
    secret: process.env.SECRET_KEY || 'secret-key',
    key: 'todoism',
    maxAge: 2592000000
  },
  mongodb: process.env.MONGODB_URI || 
    'mongodb://localhost:27017/todoism'
}
