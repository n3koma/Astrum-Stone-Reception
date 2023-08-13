const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const Level = require('../../models/Level');


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

        const floorAmount = interaction.options.get('level');
        const levelAmount = Math.floor(floorAmount.value);
        const manageType = interaction.options.get('type');
        const level = await Level.findOne({ userId: targetUserId, guildId: interaction.guild.id });

        console.log( floorAmount, levelAmount ) 

        if (!Level) {
          interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
          return;
        }
  
     try {if (manageType.value == 'add') {
          level.level += levelAmount
          level.xp = 0
          if (level.level < 0) {
            level.level = 0
          }
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのAstrum Rankを ${levelAmount} 増やしました\r\n現在のAstrum Rankは ${level.level} です`
            : `<@${targetUserId}>のAstrum Rankを ${levelAmount} 増やしました\r\n現在のAstrum Rankは ${level.level} です`
          );
        } else {if (manageType.value == 'sub') {
          level.level -= levelAmount
          level.xp = 0
          if (level.level < 0) {
            level.level = 0
          }
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
             ? `あなたのAstrum Rankを ${levelAmount} 減らしました\r\n現在のAstrum Rankは ${level.level} です`
            : `<@${targetUserId}>のAstrum Rankを ${levelAmount} 減らしました\r\n現在のAstrum Rankは ${level.level} です`
          );
        } else {if (manageType.value == 'set') {
          level.level = levelAmount
          level.xp = 0
          if (level.level < 0) {
            level.level = 0
          }
          await level.save()
          interaction.editReply(
            targetUserId === interaction.member.id
            ? `あなたのAstrum Rankを ${levelAmount} にしました\r\n現在のAstrum Rankは ${level.level} です`
            : `<@${targetUserId}>のAstrum Rankを ${levelAmount} にしました\r\n現在のAstrum Rankは ${level.level} です`
          );
        }}}
    } catch (error) {
      console.log(`/rank_manageコマンドでエラー: ${error}`);
    } },
  

    name: 'rank_manage',
    description: 'Astrum Rankを管理をする',
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
            name: 'level',
            description: 'レベルを入力する',
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