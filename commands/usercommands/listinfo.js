// Owner only. Returns all info commands.

const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js');

class infoCommand extends Command{

    constructor(client){

        super( client, {
            name: 'listinfo',
            memberName: 'listinfo',
            group: 'test',
            description: 'Shows all info commands.',
            details: 'Shows all info commands.',
			ownerOnly: true,
			guarded: true,
            examples: ['p?showinfo']
        })

    }

    run(msg){
        try{
            var printstr = `__Here are the current info commands__:\n`;
            for(const [key,value] of Object.entries(info)){
                printstr += `${key}: ${value}\n`;
            }
            const newembed = new MessageEmbed()
                .setDescription(printstr)
            msg.say(newembed)
        }
        catch{
            msg.say('Something went wrong.')
        }
    }

}

module.exports = infoCommand