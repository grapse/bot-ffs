const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'ping',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(msg,source) {
		//source to tell whether it was slash command to trigger it.
		// 0 = regular, 1 = slash
		try{
			if(source == 1){
			return msg.reply(`Pong! This was a slash command.`);
			}
			else{
				return msg.reply(`<@195688819821903872>`);
			}
		}
		catch{
			return msg.reply('Something went wrong.');
		}
		
		
	},
};