const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
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

        const targetUserId = interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
          };
    
          let user = await User.findOne(query);
          let level = await Level.findOne(query);

        if (!level) {
            interaction.editReply(
                mentionedUserId ? `${targetUserObj.user.tag} はまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
                : `あなたはまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
            );
            return;
        }

        if (!user) {
            interaction.editReply(`<@${interaction.member.id}> はまだprofileを持っていません`);
            return;
          }

        let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');
        let allBalances = await User.find({ guildId: interaction.guild.id }).select('-_id userId balance');


        allLevels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        allBalances.sort((a, b) => {return b.balance - a.level;})
        
        console.log(allLevels)

        let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;
        let currentBalance = allBalances.findIndex((bal) => bal.userId === targetUserId) + 1;

        const exampleEmbed = new EmbedBuilder()
	    .setColor(0x0099FF)
	    .setTitle('Astrum Rank Leaderboard')
	    .setAuthor({ name: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
	    .setThumbnail(`${interaction.guild.me.avatarURL({ extension: 'png' })}`,
	    	{ name: 'Regular field title', value: 'Some value here' },
	    )
	    .setImage('https://i.imgur.com/AfFp7pu.png')
	    .setTimestamp()
	    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    channel.send({ embeds: [exampleEmbed] });
    },
    
    name: 'top',
    description: 'リーダーボードを表示する',
    options: [
        {
            name: 'type',
            description: 'リーダーボードの種類を指定する',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Astrum Rank',
                    value: 'level',
                },
                {
                    name: 'Balance',
                    value: 'balance',
                },
            ],
            required: true,
        },
    ],
};