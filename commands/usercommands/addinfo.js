// Owner only. Modifying info commands.

const { Command } = require('discord.js-commando')
function searchMessage(msg,dictkey,message){
    info[dictkey] = message.id;
    msg.say(`${dictkey} has been registered as ${message.url}`)
    //update message
    modchannelobj = msg.client.channels.cache.get(modchannel);
    modchannelobj.messages.fetch(infomessage)
        .then(message => message.edit(JSON.stringify(info)))
        .catch(console.error);
    return;
}

class infoCommand extends Command{

    constructor(client){

        super( client, {
            name: 'addinfo',
            memberName: 'addinfo',
            group: 'test',
            description: 'Info add.',
            details: 'Add info.',
            examples: ['p?addinfo'],
            args: [{
                    //blank for removing all
					key: 'dictkey',
					prompt: 'What will be the key?',
					type: 'string',
				},
                {
                    key: 'mid',
                    prompt: 'What is the message ID?',
                    type: 'string',
                },
			],
        })

    }

    run(msg,{dictkey,mid}){
        try{
            if(!(dictkey in info)){
                var botchannelobj = msg.client.channels.cache.get(botchannel);
                botchannelobj.messages.fetch(mid)
                    .then(message => searchMessage(msg,dictkey,message))
                    .catch(error => msg.say(`Are you sure that's a message ID? It must also be in <#${botchannel}>.`))
            }
            else{
                msg.say(`${dictkey} is already a registered info command!`)
            }
        }
        catch{
            msg.say(`Are you sure that's a message ID? It must also be in <#${botchannel}>.`);
        }
       
    }

}

module.exports = infoCommand