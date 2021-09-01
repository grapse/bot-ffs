const { SlashCommandBuilder } = require('@discordjs/builders');
const storychannel = '854272472727420968'
const announcementchannel = '853919927420846090'
const startdate = new Date(2021,6,21,15);
const reactionEmoji = '<:FeverPoint:854957388805177348>'
const botchannel = '855720576529334272'
const Discord = require('discord.js');

function makeEmbed(text){
    var embedargs = text.split("|");
    var embedColor = '#d60270';
    var embedTitle = ' ';
    if(embedargs.length > 2){
        embedTitle = embedargs[2]
        if(embedargs.length > 3){
            if(embedargs[3].trim().length > 1){
                embedColor = embedargs[3];
            }
        }
    }
    const newembed = new Discord.MessageEmbed()
        .setColor(embedColor)
        .setTitle(embedTitle)
        .setDescription(embedargs[0]+' ')
        .setImage(embedargs[1])
    return newembed
}

function getinfo(info,msg,args){
    var lowerKey = args[1].toLowerCase();
    console.log(info);
    if(lowerKey in info){
                          sayInfo(info[lowerKey],msg,botchannel);
                          return 
                      }
                      else{
                          msg.reply('That is not a valid info command. See here:');
                          sayInfo('857567254677422120',msg,'857519718936084510');
                          return
                      }
  }
  
  function sayInfo(messageid,msg,bchannel){
    var botchannelobj = msg.client.channels.cache.get(bchannel);
                  botchannelobj.messages.fetch(messageid)
                      .then(message => msg.reply({content:' ',embeds:[makeEmbed(message.content)]}))
                      .catch(console.error);
  }



module.exports = {
	name: 'info',
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('See info.')
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
                const args = msg.content.split(' ');
                var messageid = '857567254677422120';
                if(args.length <= 2){
                    if(args.length === 2){
                        var modchannelobj = msg.client.channels.cache.get('857519718936084510');
                    modchannelobj.messages.fetch('857520353948467210')
                        .then(message => getinfo(JSON.parse(message.content),msg,args))
                        .catch(console.error);
                    }
                    else{
                      var modchannelobj = msg.client.channels.cache.get('857519718936084510');
                    modchannelobj.messages.fetch('857520353948467210')
                        .then(message => sayInfo(messageid,msg,'857519718936084510'))
                        .catch(console.error);
                    }
                }
                else{
                    msg.reply(`That is not a valid info command.`)
                }
            }
            catch{
                msg.reply('Something went wrong. Blame Grape.')
            }
		}
		catch(err){
			return msg.reply('Something went wrong.'+err);
		}
		
		
	},
};