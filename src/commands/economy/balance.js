const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
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

    const targetUserId = interaction.options.get('user')?.value || interaction.member.id;
    const targetUserId2 = targetUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId2);

    await interaction.deferReply();

    const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

    if (!user) {
        interaction.editReply(`<@${targetUserId}> はまだprofileを持っていません`);
        return;
    }

    interaction.editReply(
        targetUserId === interaction.member.id
        ? `あなたの所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
        : `${targetUserObj.user.username}の所持数は **${user.balance} <:Astrum_Stone:1139255908325658674>** です`
    )
},
    name: 'balance',
    description: '自分か他人のAstrum Stoneの所持数を確認する',
    options: [
        {
            name: 'user',
            description: '所持数を見る人を指定する',
            type: ApplicationCommandOptionType.User,

        },
    ],    
};