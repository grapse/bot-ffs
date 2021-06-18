const {
    Command
} = require('discord.js-commando')

class sayCommand extends Command {

    constructor(client) {

        super(client, {
            name: 'mirror',
            memberName: 'mirror',
            group: 'test',
            aliases: ['echo', 'repeat'],
            description: 'Repeat message into channel',
            details: "Repeat message into channel",
            examples: ['p?mirror Hello World', 'p?repeat Who Am I?'],
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

    run(msg, { channel, text }) {
        try{
            msg.client.channels.cache.get(channel).send(text);
            //return msg.delete()
        }
        catch{
            msg.say('Something went wrong.')
        }
        
    }

}

module.exports = sayCommand