const { Schema, model } = require('mongoose');

//DBに保存するデータの定義
const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastDaily: {
    type: Date,
    reqired: true,
  },
  lastDaily2: {
    type: Date,
    reqired: true,
  },
});

module.exports = model('User', userSchema);