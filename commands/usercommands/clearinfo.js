// Owner only. Modifying info commands.

const { Command } = require('discord.js-commando')

class infoCommand extends Command{

    constructor(client){

        super( client, {
            name: 'clearinfo',
            memberName: 'clearinfo',
            group: 'test',
            description: 'Info modifying.',
            details: 'Clears info for selected command.',
			ownerOnly: true,
			guarded: true,
            examples: ['p?clearinfo'],
            args: [{
                    //blank for removing all
					key: 'dictkey',
					prompt: 'Which one to remove?',
					type: 'string',
                    default: ''
				},
			],
        })

    }

    run(msg,{dictkey}){
        try{
            if (!dictkey){
                info = {};
                msg.say(`The reset has been done.`)
                //update message
                modchannelobj = msg.client.channels.cache.get(modchannel);
                modchannelobj.messages.fetch(infomessage)
                    .then(message => message.edit(JSON.stringify(info)))
                    .catch(console.error);
            }
            else if(dictkey in info){
                msg.say(`The command for ${dictkey} has been deleted.`);
                delete info[dictkey];
                //update message
                modchannelobj = msg.client.channels.cache.get(modchannel);
                modchannelobj.messages.fetch(infomessage)
                    .then(message => message.edit(JSON.stringify(info)))
                    .catch(console.error);
                
            }
            else{
                msg.say(`I could not find an info command for ${dictkey}`)
            }
        }
        catch{
            msg.say(`Something went wrong.`);
        }
       
    }

}

module.exports = infoCommand