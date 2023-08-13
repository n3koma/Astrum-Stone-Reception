const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');
const Level = require('../../models/Level');

function stones(amount) {
  if (amount === 1) return 5;
  if (amount === 2) return 10;
  if (amount === 3) return 15;
  if (amount === 4) return 20;
  if (amount === 5) return 30;
  if (amount === 6) return 40;
  if (amount === 7) return 50;
  if (amount === 8) return 65;
  if (amount === 9) return 80;
  if (amount === 10) return 100;
}

module.exports = {
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

      await interaction.deferReply();

        const interactionUserId = await interaction.member.id;
        const interactionUserObj = await interaction.guild.members.fetch(interactionUserId);

        const user = await User.findOne({ userId: interactionUserId, guildId: interaction.guild.id });
        const level = await Level.findOne({ userId: interactionUserId, guildId: interaction.guild.id });
        const floorAmount = await interaction.options.get('amount') || level.level;
        let resetAmount;
        if (typeof floorAmount == 'object') {
          resetAmount = Math.floor(floorAmount.value);
        } else {if (typeof floorAmount == 'number') {
          resetAmount = level.level
        }};

          function subLevel(amount) {
          if (amount <= level.level) return resetAmount;
          if (amount > level.level) return level.level;
          }

        if (!user) {
          interaction.editReply(`<@${interactionUserId}> はまだprofileを持っていません`);
          return;
        }

        console.log(floorAmount, resetAmount);
  
        try {if (user) {
          const lastDailyDate2 = user.lastDaily2.toDateString();
          const currentDate = new Date().toDateString();
  
          if (lastDailyDate2 === currentDate) {
            await interaction.editReply(
              `星はもう満足なようです\r\n明日になれば再び現れるでしょう`
            );
            return;
          }
          
          user.lastDaily2 = new Date();
        } else {
          user = new User({
            ...query,
            lastDaily2: new Date(),
          });
        }

         if (subLevel(resetAmount) <= 0) {
           await interaction.editReply({ content: `Astrum Rank0以下では実行できません`, ephemeral: true })
         } else {if (resetAmount > 10 || resetAmount <= 0) {
          await interaction.editReply({ content: `amountは1~10の範囲で入力してください`, ephemeral: true  })
         } else {if (level.level > 0 && resetAmount <= 10 && resetAmount > 0) {
          await interaction.editReply(`星羅がまた巡り始めました\r\n${stones(resetAmount)}の星群が落ちてきます`)
          user.balance += stones(subLevel(resetAmount))
          level.level -= subLevel(resetAmount)
          level.xp = 0
          await level.save()
          await user.save()
         }
         }
         }
    } catch (error) {
      console.log(`/reincarnationコマンドでエラー: ${error}`);
    } },
  

    name: 'reincarnation',
    description: 'Astrum Rankをリセットする  一日一回まで',
    options: [
        {
            name: 'amount',
            description: 'リセットするレベルを入力する  1~10まで',
            type: ApplicationCommandOptionType.Number,
        },
    ],
}