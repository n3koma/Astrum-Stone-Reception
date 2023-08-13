const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const User = require('../../models/User');


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

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId;
        const interactionUserId = interaction.member.id;

        const floorAmount = interaction.options.get('amount');
        const payAmount = Math.floor(floorAmount.value);
        const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });
        const giveUser = await User.findOne({ userId: interactionUserId, guildId: interaction.guild.id });

        if (!user) {
          interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
          return;
        }
        if (!giveUser) {
          interaction.editReply(`<@${interactionUserId}> はまだprofileを持っていません`);
          return;
        }
  
     try {if (giveUser.balance >= payAmount && targetUserId !== interactionUserId && payAmount > 0) {
          user.balance += payAmount
          giveUser.balance -= payAmount
          await user.save()
          await giveUser.save()
          interaction.editReply(
          `<@${targetUserId}> に **${payAmount} <:Astrum_Stone:1139255908325658674>** を渡しました\r\nあなたの現在の所持数は **${giveUser.balance} <:Astrum_Stone:1139255908325658674>** です`
          )
          } else {if (giveUser.balance < payAmount) {
            interaction.editReply({
              content: `Astrum Stoneが足りません\r\nあなたの所持数は **${giveUser.balance} <:Astrum_Stone:1139255908325658674>** です`, ephemeral: true
            })
          return;
          } else {if (targetUserId === interactionUserId) {
            interaction.editReply({
              content: `自分に/giveを行うことはできません`, ephemeral: true
            })
          return;
          } else {if (payAmount <= 0) {
            interaction.editReply({
              content: `0以下の数値を入力することはできません`, ephemeral: true
            })
          return;
          }
          }
          }
          }
    } catch (error) {
      console.log(`/payコマンドでエラー: ${error}`);
    } },
  

    name: 'give',
    description: 'Astrum Stoneを渡す',
    options: [
        {
            name: 'amount',
            description: '数を入力する',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'target-user',
            description: '渡す人を指定する',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
    ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],
}