const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const LevelDB = require('../../models/Level');
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

        const targetUserId = interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
        };

        let userData = await UserDB.findOne(query);
        //resist外
        if (!userData) {
            interaction.editReply(`<@${interaction.member.id}> はまだprofileを持っていません`);
            return;
        }

        const reqType = interaction.options.get('type');
        //スイッチしてやる
        switch (reqType) {
            case "level":
                levelProcess(interaction, userData, targetUserObj);
                break;
            case "balance":
                balanceProcess(interaction, userData, targetUserObj);
                break;
            default:
                throw "error";
                return;
                break;
        }
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

const levelProcess = async (interaction, userData, targetUserObj) => {
    //データ取得
    let levelData = await LevelDB.findOne(query);

    if (!levelData) {
        interaction.editReply(
            mentionedUserId ? `${targetUserObj.user.tag} はまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
                : `あなたはまだlevelsを持っていません\r\nチャットがもう少し進んだ時に再度試してください`
        );
        return;
    }

    let allLevels = await LevelDB.find({ guildId: interaction.guild.id }).select('-_id userId level xp');

    //これでソート
    allLevels.sort((a, b) => {
        if (a.level === b.level) {
            return b.xp < a.xp ? 1 : -1;
        } else {
            return b.level < a.level ? 1 : -1;
        }
    });

    const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Astrum Rank Leaderboard')
            .setAuthor({ name: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

    let description;
    for (let i = 0; i < 10; i++) {
        user = allLevels[i].userId;
        xp = allLevels[i].xp;
        if(allLevels.length < i){
            return;
        }
        description += `#${i + 1}| <@${user}> XP:${xp}` + "\n";
    }
    embed.description = description;
    interaction.editReply({ embeds: [embed] });
}
const balanceProcess = async (interaction, userData, targetUserObj) => {
    let allBalances = await UserDB.find({ guildId: interaction.guild.id }).select('-_id userId balance');
    allBalances.sort((a, b) => { return b.balance - a.level; })

    const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Astrum Rank Leaderboard')
            .setAuthor({ name: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();
    let description;
    for (let i = 0; i < 10; i++) {
        user = allBalances[i].userId;
        xp = allBalances[i].xp;
        if(allBalances.length < i){
            return;
        }
        description += `#${i + 1}| <@${user}> XP:${xp}` + "\n";
    }
    embed.description = description;
    interaction.editReply({ embeds: [embed] });
}