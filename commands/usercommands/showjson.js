// Owner only. Returns string JSON of dictionary

const { Command } = require('discord.js-commando')

class showCommand extends Command{

    constructor(client){

        super( client, {
            name: 'showjson',
            memberName: 'showjson',
            group: 'test',
            description: 'Shows JSON stringified.',
            details: '.',
			ownerOnly: true,
			guarded: true,
            args: [{
                key: 'type',
                prompt: 'Which one? (points or info)',
                type: 'string',
                oneOf: ['points','info'],
            }],
            examples: ['p?showjson points']
        })

    }

    run(msg,{type}){
        try{
            if(type === 'points'){
                msg.say(JSON.stringify(feverpoints))
            }
            else if(type === 'info'){
                msg.say(JSON.stringify(info))
            }
        }
        catch{
            msg.say('Something went wrong.')
        }
    }

}

module.exports = showCommand