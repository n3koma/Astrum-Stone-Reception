const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const UserDB = require('../../models/User');


module.exports = {
  /**
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

    const targetUserId = interaction.options.get('target-user')?.value || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const floorAmount = interaction.options.get('amount');
    const manageAmount = Math.floor(floorAmount.value);
    const manageType = interaction.options.get('type');
    const userData = await UserDB.findOne({ userId: targetUserId, guildId: interaction.guild.id });

    if (!userData) {
      interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
      return;
    }

    try {
      if (manageType.value == 'add') {
        userData.balance += manageAmount
        await userData.save()
        interaction.editReply(
          targetUserId === interaction.member.id
            ? `あなたのAstrum Stoneを ${manageAmount} 増やしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
            : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} 増やしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
        );
      } else {
        if (manageType.value == 'sub') {
          userData.balance -= manageAmount
          await userData.save()
          interaction.editReply(
            targetUserId === interaction.member.id
              ? `あなたのAstrum Stoneを ${manageAmount} 減らしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
              : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} 減らしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
          );
        } else {
          if (manageType.value == 'set') {
            userData.balance = manageAmount
            await userData.save()
            interaction.editReply(
              targetUserId === interaction.member.id
                ? `あなたのAstrum Stoneを ${manageAmount} にしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
                : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} にしました\r\n現在の所持数は **${userData.balance} <:Astrum_Stone:1139255908325658674>** です`
            );
          }
        }
      }
    } catch (error) {
      console.log(`/stone_manageコマンドでエラー: ${error}`);
    }
  },


  name: 'stone_manage',
  description: 'Astrum Stoneの数を管理をする',
  options: [
    {
      name: 'type',
      description: '管理方法を選ぶ',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'add',
          value: 'add',
        },
        {
          name: 'sub',
          value: 'sub',
        },
        {
          name: 'set',
          value: 'set',
        },
      ],
      required: true,
    },
    {
      name: 'amount',
      description: '数を入力する',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: 'target-user',
      description: '管理する人を指定する',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],
}