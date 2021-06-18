// Owner only. Resets the budgets.

const { Command } = require('discord.js-commando')

class budgetCommand extends Command{

    constructor(client){

        super( client, {
            name: 'resetbudgets',
            memberName: 'resetbudgets',
            group: 'test',
            description: 'Resets all budgets.',
            details: 'Resets all budgets.',
			ownerOnly: true,
			guarded: true,
            examples: ['p?resetbudgets'],
            args: [{
					key: 'type',
					prompt: 'What kind of reset will it be?',
					type: 'string',
                    oneOf: ['single','all'],
				},
                {
                    key: 'id',
                    prompt: 'What is the ID of the user?',
                    type: 'string',
                    default: 'none',
                },
                {
                    key: 'amount',
                    prompt: 'How much to reset to?',
                    type: 'integer',
                    default: 8,
                    validate: amount => 0 <= amount <= 8,
                },
			],
        })

    }

    run(msg,{type,id,amount}){
        try{
            if(type === 'single'){
                if(id in feverpoints){
                    feverpoints[id] = amount;
                    msg.say(`The points for <@${id}> have been reset to ${amount}`);
                }
                else{
                    msg.say(`<@${id}> is not in the list yet.`);
                }
            }
            else if (type === 'all'){
                feverpoints = {};
                msg.say(`The reset has been done.`)
            }
        }
        catch{
            msg.say(`Something went wrong.`);
        }
       
    }

}

module.exports = budgetCommand