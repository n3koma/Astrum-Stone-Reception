const { Client, Message } = require('discord.js');
const User = require('../../models/User');

/**
 * 
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
    if (!message.inGuild() || message.author.bot) return;

    const user = await User.findOne({ userId: message.author.id, guildId: message.guild.id });

    if (!user) {
            //create new user
            const newUser = new User({
                userId: message.author.id,
                guildId: message.guild.id,
                balance: 10,
                lastDaily: null,
                lastDaily2: null,
        });

        await newUser.save();
        } else {return;}
    }