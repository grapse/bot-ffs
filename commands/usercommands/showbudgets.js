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
        msg.reply(JSON.stringify(feverpoints))
    }

}

module.exports = budgetCommand