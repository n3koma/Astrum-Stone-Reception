const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');


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

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const floorAmount = interaction.options.get('xp');
        const xpAmount = Math.floor(floorAmount)
        const manageType = interaction.options.get('type');
        const level = await Level.findOne({ userId: targetUserId, guildId: interaction.guild.id });

        if (!Level) {
          interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
          return;
        }
  
     try {if (manageType.value == 'add') {
          if (level.xp < 0) {
            level.xp = 0
          }
          level.xp += xpAmount
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのxpを ${xpAmount} 増やしました\r\n現在のxpは ${level.xp}/${calculateLevelXp(level.level)} です`
            : `<@${targetUserId}>のxpを ${xpAmount} 増やしました\r\n現在のAstrum Rankは ${level.xp}/${calculateLevelXp(level.level)}} です`
          );
        } else {if (manageType.value == 'sub') {
          level.xp -= xpAmount
          if (level.xp < 0) {
            level.xp = 0
          }
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
             ? `あなたのxpを ${xpAmount} 減らしました\r\n現在のxpは ${level.xp}/${calculateLevelXp(level.level)} です`
            : `<@${targetUserId}>のxpを ${xpAmount} 減らしました\r\n現在のxpは ${level.xp}/${calculateLevelXp(level.level)} です`
          );
        } else {if (manageType.value == 'set') {
          level.xp = xpAmount
          if (level.xp < 0) {
            level.xp = 0
          }
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのxpを ${xpAmount} にしました\r\n現在のxpは ${level.xp}/${calculateLevelXp(level.level)} です`
            : `<@${targetUserId}>のxpを ${xpAmount} にしました\r\n現在のxpは ${level.xp}/${calculateLevelXp(level.level)} です`
          );
        }}}
    } catch (error) {
      console.log(`/rank_manageコマンドでエラー: ${error}`);
    } },
  

    name: 'xp_manage',
    description: 'Astrum Rankのxpを管理をする',
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
            name: 'xp',
            description: 'xpを入力する',
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