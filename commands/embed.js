const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');


module.exports = {
	name: 'embed',
	data: new SlashCommandBuilder()
		.setName('embed')
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
                const channel = args[0];
                args.shift()
                var embedargs = args.join(' ').split("|");
                var embedColor = '#d60270';
                var embedTitle = 'title';
                if(embedargs.length > 2){
                    embedTitle = embedargs[2]
                    if(embedargs.length > 3){
                        embedColor = embedargs[3];
                    }
                }
                const newembed = new Discord.MessageEmbed()
                    .setColor(embedColor)
                    .setTitle(embedTitle)
                    .setDescription(embedargs[0]);
                if(embedargs[1]){
                    newembed.setImage(embedargs[1]);
                }
                msg.client.channels.cache.get(channel).send({embeds:[newembed]});
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