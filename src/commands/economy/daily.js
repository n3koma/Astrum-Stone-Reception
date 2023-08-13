const { Client, Interaction } = require('discord.js');
const User = require('../../models/User');
const Level = require('../../models/Level');

module.exports = {
  name: 'wish',
  description: '星に願う  一日一回まで',
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: 'このコマンドはサーバー内のみで実行できます',
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);
      let level = await Level.findOne(query);

      if (!user) {
        interaction.editReply(`<@${interaction.member.id}> はまだprofileを持っていません`);
        return;
      }

      if (user) {
        const lastDailyDate = user.lastDaily.toDateString();
        const currentDate = new Date().toDateString();

        if (lastDailyDate === currentDate) {
          interaction.editReply(
            `今日は既に願いました\r\n明日にはまた綺麗な星が見れるでしょう`
          );
          return;
        }
        
        user.lastDaily = new Date();
      } else {
        user = new User({
          ...query,
          lastDaily: new Date(),
        });
      }

      const dailyAmountLevel = level.level;
      const dailyAmount = dailyAmountLevel;

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