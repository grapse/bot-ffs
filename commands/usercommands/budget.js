const { Command } = require('discord.js-commando')

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
        try{
            const reactionEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
            var current = new Date();
            if(current < startdate){
                msg.reply(`The main event hasn't started yet! Please see <#${storychannel}> for when it begins~`);
            }
            else if(msg.member.roles.cache.some(r=>r.name==="🎸Summer Event")){
                if(msg.author.id in feverpoints){  // If already reacted
                    msg.reply(`Your remaining budget for this week is ${feverpoints[msg.author.id]} ${reactionEmoji}`)
                }
                else{  // Otherwise add to the dict
                    feverpoints[msg.author.id] = 8;
                    msg.reply(`Your remaining budget for this week is 8 ${reactionEmoji}. Try spending some on works that move your heart~`)
                }
            }
            else{
                msg.reply(`You are not a member of the event~! Please see <#${announcementchannel}> if you would like to take part.`)
            }
        }
        catch{
            msg.reply(`Something went wrong. Please contact Grape.`);
        }

    }

}

module.exports = budgetCommand