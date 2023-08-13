const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  deleted: true,
  name: 'ban',
  description: 'メンバーをBANします',
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: 'target-user',
      description: 'BANするユーザーです',
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: 'reason',
      description: 'BANする理由です',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: (client, interaction) => {
    interaction.reply('BAN..');
  },
};
