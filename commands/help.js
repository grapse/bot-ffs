const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get information about Producer bot.')
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
                var channelobj = msg.client.channels.cache.get("855248622449852436");
                channelobj.messages.fetch('886808403140304927')
					.then(m => {
                        var messagecontents = m.content.split('|split|');
                        msg.reply({embeds:[new Discord.MessageEmbed().setDescription(messagecontents[0]).setImage(messagecontents[1])]});
                    })
					.catch(console.error);
            }
            catch(err){
                msg.reply(`Something went wrong: ${err}. Please contact Grape.`);
            }
		}
		catch(err){
			return msg.reply('Something went wrong.'+err);
		}
		
		
	},
};