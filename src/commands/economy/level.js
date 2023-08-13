const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord')
const calculateLevelXp = require('../../utils/calculateLevelXp');
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

        const fetchedLevel = await Level.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
        });

        if (!fetchedLevel) {
            interaction.editReply(
                mentionedUserId ? `${targetUserObj.user.tag} はまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
                : `あなたはまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
            );
            return;
        }

        let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');

        allLevels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        const rank = new canvacord.Rank()
        .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 })) 
        .setRank(currentRank)
        .setLevel(fetchedLevel.level)
        .setCurrentXP(fetchedLevel.xp)
        .setRequiredXP(calculateLevelXp(fetchedLevel.level))
        .setStatus(targetUserObj.presence.status)
        .setProgressBar('#FFC300', 'COLOR')
        .setUsername(targetUserObj.user.username)
        .setDiscriminator(targetUserObj.user.discriminator);

        const data = await rank.build();
        const attachment = new AttachmentBuilder(data);
        interaction.editReply({ files: [attachment] })
    },
    
    name: 'rank',
    description: '自分か他人のAstrum Rankを確認する',
    options: [
        {
            name: 'target-user',
            description: 'Rankを見る人を指定する',
            type: ApplicationCommandOptionType.Mentionable,

        },
    ],
};