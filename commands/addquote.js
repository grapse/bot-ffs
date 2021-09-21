const { SlashCommandBuilder } = require('@discordjs/builders');
const storychannel = '854272472727420968'
const announcementchannel = '853919927420846090'
const startdate = new Date(2021,6,21,15);
const reactionEmoji = '<:FeverPoint:854957388805177348>'
const Discord = require('discord.js');

require('dotenv').config()
//Firebase----------------------------------
const firebaseAdminKey = process.env.firebaseAdminKey;

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("../ffs-bot-4432a48dc561.json");
serviceAccount['private_key'] = process.env.private_key.replace(/\\n/g, '\n');

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ffs-bot-default-rtdb.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: firebaseAdminKey
  }
},'addquoteapp');

module.exports = {
	name: 'addquote',
	data: new SlashCommandBuilder()
		.setName('addquote')
		.setDescription('Add quote.')
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
                var dictkey = args[0]
                if(!dictkey || dictkey.length > 25){
                    return msg.reply('Invalid key!')
                }
                var content = args[1];
                var db = admin.database();
                var quoteRef = db.ref('quotes/'+dictkey);
    
                quoteRef.get().then((snapshot) => {
                if (snapshot.exists()) {
                  msg.reply(`That quote already exists.`);
                } else {
                    quoteRef.set({
                      cid: msg.channel.id,
                      mid: msg.id,
                    })
                    msg.reply(`${content} has been added to ${dictkey}!`);
                  }
                }).catch((error) => {
                  console.error(error);
                });
            }
            catch{
                msg.reply(`Something went wrong. You should notify Grape.`);
            }
		}
		catch(err){
			return msg.reply('Something went wrong.'+err);
		}
		
		
	},
};