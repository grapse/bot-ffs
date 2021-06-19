const { DiscordAPIError } = require('discord.js');
const {
    Command
} = require('discord.js-commando')
const { MessageEmbed } = require('discord.js');

class sayCommand extends Command {

    constructor(client) {

        super(client, {
            name: 'embed',
            memberName: 'embed',
            group: 'test',
            aliases: ['mirrorembed'],
            description: 'Repeat embedded message into channel.',
            details: "Repeat embedded message into channel",
            examples: ['p?embed Hello World'],
            clientPermissions: ["MANAGE_MESSAGES"],
            ownerOnly: true,
			guarded: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What is the channel you would like this mirrored in?',
                    type: 'string',
                    default: storychannel
                },
                {
                    key: 'text',
                    prompt: 'What would you like said?',
                    type: 'string'
                }]
        })

    }

    run(msg, { channel,text }) {
        try{
            var embedargs = text.split("|");
            var embedColor = '#d60270';
            var embedTitle = 'Producer Tips';
            if(embedargs.length > 2){
                embedTitle = embedargs[2]
                if(embedargs.length > 3){
                    embedColor = embedargs[3];
                }
            }
            const newembed = new MessageEmbed()
                .setColor(embedColor)
                .setTitle(embedTitle)
                .setDescription(embedargs[0])
                .setImage(embedargs[1])
            msg.client.channels.cache.get(channel).send(newembed);
        }
        catch{
            msg.say('Something went wrong.')
        }
        
    }

}

module.exports = sayCommand