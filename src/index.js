require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

//インテント、これを書かないと使えない機能がある
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    //DBに接続
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DBに接続しました');

    //イベントhandling用のプロセス開始
    eventHandler(client);  
    //ログイン
    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`エラー: ${error}`)
  }
})();