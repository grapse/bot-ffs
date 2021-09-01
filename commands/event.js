const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

function makeEmbed(msg){
    var title = ' ';
    if (msg.title){
      title = msg.title;
    }
    var img = ' ';
    if (msg.image){
      img = msg.image.url;
    }
    const newembed = new Discord.MessageEmbed()
        .setColor(msg.color)
        .setTitle(title)
        .setDescription(msg.description)
        .setImage(img)
    return newembed
}

module.exports = {
	name: 'event',
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('???')
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
                if(msg.author.id != '195688819821903872'){
                    return;
                }
                return;
                user = msg.user;
                args = msg.options;
			}
			else{
                user = msg.author;
                if(msg.author.id != '195688819821903872'){
                    return;
                }
                
				args = msg.content.split(' ');
                args.shift();
			}
            try{
            var message = args[0];
            var channel = '854272472727420968' // change for event announce
            var modchannel = '870141666902835250'
            var channelobj = msg.client.channels.cache.get(channel);
            var modchannelobj = msg.client.channels.cache.get(modchannel);
            modchannelobj.messages.fetch(message)
                .then(m => channelobj.send({embeds:[makeEmbed(m.embeds[0])]}))
                .catch(console.error);
            }
            catch(err){
                msg.reply('Something went wrong. '+err)
            }
            
		}
		catch(err){
			return msg.reply('Something went wrong.'+err);
		}
		
		
	},
};