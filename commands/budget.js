const { SlashCommandBuilder } = require('@discordjs/builders');
const storychannel = '854272472727420968'
const announcementchannel = '853919927420846090'
const startdate = new Date(2021,6,21,15);
const reactionEmoji = '<:FeverPoint:854957388805177348>'

function budgetupdate(msg,ptmsg,feverpoints){
    var current = new Date();
    if(current < startdate){
        msg.reply(`The main event hasn't started yet! Please see <#${announcementchannel}> for when it begins~`);
    }
    else if(msg.member.roles.cache.some(r=>r.name==="🎸Summer Event")){
        if(msg.author.id in feverpoints){  // If already reacted
            msg.reply(`Your remaining budget for this week is ${feverpoints[msg.author.id]} ${reactionEmoji}`)
        }
        else{  // Otherwise add to the dict
            feverpoints[msg.author.id] = 15;
            msg.reply(`Your remaining budget for this week is 15 ${reactionEmoji}. Try spending some on works that move your heart~`)
            ptmsg.edit(JSON.stringify(feverpoints));
        }
    }
    else{
        msg.reply(`You are not a member of the event~! Please see <#${announcementchannel}> if you would like to take part.`)
    }
    
    return;
}


module.exports = {
	name: 'budget',
	data: new SlashCommandBuilder()
		.setName('budget')
		.setDescription('See your remaining budget')
        ,
	async execute(msg,source) {
		//source to tell whether it was slash command to trigger it.
		// 0 = regular, 1 = slash
        var args = msg;
        var user = msg;
		try{
            //Configure user and args depending on slash or regular commmand.
            //Only reply and etc can be used 
			if(source == 1){
                user = msg.user;
                
                args = msg.options;
			}
			else{
                user = msg.author;
                
				args = msg.content.split(' ');
                args.shift();
			}
            //msg.reply(args.toString());
            try{
                //update message
                    var modchannelobj = msg.client.channels.cache.get('857519718936084510');
                    modchannelobj.messages.fetch('857520219999305728')
                        .then(message => budgetupdate(msg,message,JSON.parse(message.content)))
                        .catch(console.error);
            }
            catch{
                msg.reply(`Something went wrong. Please contact Grape.`);
            }
		}
		catch(err){
			return msg.reply('Something went wrong.'+err);
		}
		
		
	},
};