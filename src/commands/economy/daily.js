const { Client, Interaction } = require('discord.js');
const UserDB = require('../../models/User');
const LevelDB = require('../../models/Level');

module.exports = {
  name: 'wish',
  description: '星に願う  一日一回まで',
  //これは、エディターでエラーが出るのを防ぐ。実行時は関係ない。
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    //コールバック関数。実行された際、これを実行する。
    if (!interaction.inGuild()) {
      interaction.reply({
        content: 'このコマンドはサーバー内のみで実行できます',
        ephemeral: true,
      });
      return;
    }

    try {
      //考え中...にする。これをしないと、15秒でタイムアウトになる。
      await interaction.deferReply();

      //インタラクションのデータを読む
      const query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      //DBからqueryのデータを探す
      let user = await UserDB.findOne(query);
      let level = await LevelDB.findOne(query);

      //登録されているか
      if (user) {
        const lastDailyDate = user.lastDaily.toDateString();
        const currentDate = new Date().toDateString();

        //今日もう既にやったか
        if (lastDailyDate === currentDate) {
          interaction.editReply(
            `今日は既に願いました\r\n明日にはまた綺麗な星が見れるでしょう`
          );
          return;
        }
        //やってなかった時の時刻登録
        user.lastDaily = new Date();
      } else {
        //登録
        user = new UserDB({
          ...query,
          lastDaily: new Date(),
        });
      }

      //レベルを変数に割り当て
      const dailyAmount = level.level;

      user.balance += dailyAmount;
      await user.save();

      interaction.editReply(
        `${dailyAmount}の星が輝き、星はあなたの願いに応えました`
      );
    } catch (error) {
      console.log(`/wishコマンドでエラー: ${error}`);
    }
  },
};