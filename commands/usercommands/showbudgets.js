// Owner only. Returns dictionary of all user IDs and their fever points.

const { Command } = require('discord.js-commando')

class budgetCommand extends Command{

    constructor(client){

        super( client, {
            name: 'showbudgets',
            memberName: 'showbudgets',
            group: 'test',
            description: 'Shows all budgets.',
            details: 'Shows all budgets.',
			ownerOnly: true,
			guarded: true,
            examples: ['p?showbudgets']
        })

    }

    run(msg){
        try{
            var printstr = `__Here are the current budgets__:\n`;
            for(const [key,value] of Object.entries(feverpoints)){
                printstr += `<@${key}>: ${value}\n`;
            }
            msg.say(printstr)
        }
        catch{
            msg.say('Something went wrong.')
        }
    }

}

module.exports = budgetCommand