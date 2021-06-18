const { Command } = require('discord.js-commando')
const emojiname = '<:FeverPoint:855263455681970205>'

class budgetCommand extends Command{

    constructor(client){

        super( client, {
            name: 'budget',
            memberName: 'budget',
            aliases: ['b'],
            group: 'test',
            description: 'Shows the remaining weekly budget.',
            details: 'Shows the remaining weekly budget.',
            examples: ['p?budget','p?b']
        })

    }

    run(msg){
        if(msg.member.roles.cache.some(r=>r.name==="🎸Summer Event")){
            if(msg.author.id in feverpoints){  // If already reacted
                msg.reply(`Your remaining budget for this week is ${feverpoints[msg.author.id]} ${emojiname}`)
            }
            else{  // Otherwise add to the dict
                feverpoints[msg.author.id] = 8;
                msg.reply(`Your remaining budget for this week is 8 ${emojiname}. Try spending some on works that move your heart~`)
            }
        }
        else{
            msg.reply(`You are not a member of the event~! Please see #announcements if you would like to take part.`)
        }
    }

}

module.exports = budgetCommand