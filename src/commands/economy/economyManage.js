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
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const floorAmount = interaction.options.get('amount');
        const manageAmount =  Math.floor(floorAmount.value);
        const manageType = interaction.options.get('type');
        const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

        if (!user) {
          interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
          return;
        }
  
     try {if (manageType.value == 'add') {
          user.balance += manageAmount
          await user.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのAstrum Stoneを ${manageAmount} 増やしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
            : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} 増やしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
          );
        } else {if (manageType.value == 'sub') {
          user.balance -= manageAmount
          await user.save()
          interaction.editReply(
            targetUserId === interaction.member.id
             ? `あなたのAstrum Stoneを ${manageAmount} 減らしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
            : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} 減らしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
          );
        } else {if (manageType.value == 'set') {
          user.balance = manageAmount
          await user.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのAstrum Stoneを ${manageAmount} にしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
            : `<@${targetUserId}>のAstrum Stoneを ${manageAmount} にしました\r\n現在の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
          );
        }}}
    } catch (error) {
      console.log(`/stone_manageコマンドでエラー: ${error}`);
    } },
  

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