// Shows info depending on keyword

const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js');

function makeEmbed(text){
    var embedargs = text.split("|");
    var embedColor = '#d60270';
    var embedTitle = '';
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
    return newembed
}
class infoCommand extends Command{

    constructor(client){

        super( client, {
            name: 'info',
            memberName: 'info',
            group: 'test',
            description: 'Displays info.',
            details: 'Quote.',
            examples: ['p?info, p?info sky']
        })

    }

    run(msg){
        try{
            const args = msg.content.split(' ');
            var messageid = '857447232949059604';
            var embedformat = ' a';
            if(args.length <= 2){
                if(args.length === 2){
                    if(args[1] in info){
                        messageid = info[args[1]]
                    }
                    else{
                        msg.say('That is not a valid info command. See here:')
                    }
                }
                var botchannelobj = msg.client.channels.cache.get(botchannel);
                botchannelobj.messages.fetch(messageid)
                    .then(message => msg.say(makeEmbed(message.content)))
                    .catch(console.error);
            }
            else{
                msg.say(`That is not a valid info command.`)
            }
        }
        catch{
            msg.say('Something went wrong. Blame Grape.')
        }
    }

}

module.exports = infoCommand