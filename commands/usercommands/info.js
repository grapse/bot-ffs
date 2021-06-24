// Shows info depending on keyword

const { Command } = require('discord.js-commando')

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
            const args = msg.content.slice(2).trim().split(' ');
            var message = '';
            if(args.length > 1){
                msg.say(`That is not a valid info command.`);
                return;
            }
            else if(args.length === 0){

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