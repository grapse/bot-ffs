const { SlashCommandBuilder } = require('@discordjs/builders');
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
},'wikidelapp');

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  //---------------------------------------------------------------

module.exports = {
	name: 'wikidelete',
	data: new SlashCommandBuilder()
		.setName('wikidelete')
		.setDescription('???')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('query')
                .setRequired(false)),
	async execute(msg,source,search='') {
		//source to tell whether it was slash command to trigger it.
		// 0 = regular, 1 = slash
        var args = msg;
        var user = msg;
		try{
            //Configure user and args depending on slash or regular commmand.
            //Only reply and etc can be used 
			if(source == 1){
                user = msg.user;
                    return msg.reply('The wiki is not available via slash command yet!')
                args = interaction.data.options[0];
			}
            else if(source == 2){
                user = msg.author;
                args=search;
            }
			else{
                user = msg.author;
                
				args = msg.content.substr(msg.content.indexOf(" ") + 1);
                if(args == 'p?wiki'){
                    return msg.reply('Please include a search, or use `p?wiki random` for a surprise! \nIf you would like to add your own Servants, please use `p?wikitemplate` for more info!')
                }
			}

            var query = args.toLowerCase();
            var searchnumber = null; // the entry to search for
            //Query database
            var querysplit = query.split('/');
            if(querysplit.length > 1){
                // Prevent users from searching further down the database
                
                if(querysplit.length > 2 || !Number.isInteger(Number(querysplit[1]))){
                    throw "You included a `/` in your search!";
                }
                if(Number(querysplit[1]) >= 0 && Number(querysplit[1] <= 4)){
                    searchnumber = Number(querysplit[1]);
                    query = querysplit[0]
                }
                else{
                    throw "That search is invalid! You may have included a slash, or the number is invalid.";
                }
              }
              var db = admin.database();
              if(query == ''){
                    return msg.reply(`You may have sent a blank search.`);
              }
              else{
                var search = db.ref('wiki/'+query);
    
                search.get().then((snapshot) => {
                    
                if (!snapshot.exists()) {
                    // Make sure search exists
                    msg.reply(`There does not appear to be a page for \`${query}\`.`);
                    //TODO: throw error if there is not similar search, otherwise give most similar
                } 
                else {
                    var results = snapshot.val();
                    if(Object.keys(results).length > 1 && searchnumber == null){
                        var searchoptions = '';
                        for (let i in results) {
                            searchoptions += `${results[i].truename} by <@${results[i].author}>: \`p?wiki ${results[i].refPath}\`\n`;
                        }
                        return msg.reply({content:`There was more than one result for \`${query}\`! Here are your options:`
                                        ,embeds:[new Discord.MessageEmbed().setDescription(searchoptions).setColor('#ffffff')]});
                    }
                    if(!searchnumber){
                        searchnumber = Object.keys(results)[0];
                    }
                    if(!results[searchnumber]){
                        return msg.reply(`There does not appear to be a page for \`${query}/${searchnumber}\`.`);;
                    }
                    var info = results[searchnumber];
                    if(info.isRef == 'true'){
                        db.ref('wiki/'+info.refPath).get().then((realpath) => {
                            if(!realpath.exists()){
                                return msg.reply(`There does not appear to be a page for \`${query}/${searchnumber}\`.`);;
                            }
                            var info = realpath.val();
                            if(msg.author.id == info['author']){
                                if(info.refPath){
                                    db.ref('wiki/'+info.refPath).remove();
                                    if(info.nicknameTokens){
                                        for(i = 0;i<info.nicknameTokens.length;i++){
                                            db.ref('wiki/'+info.nicknameTokens[i]).remove();
                                        }
                                    }
                                    db.ref('servantlist').get().then((realpath) => {
                                        if(!realpath.exists()){
                                            return msg.reply('Something went wrong with removing it.')
                                        }
                                        var getservantlist = realpath.val();
                                        var checkexists = getKeyByValue(getservantlist,info.refPath)
                                        if(checkexists){
                                            db.ref('servantlist/'+checkexists).remove();
                                        }
                                        db.ref('users/"'+info['author']+'"/servants/').get().then((realpath) => {
                                            if(!realpath.exists()){
                                                return msg.reply('Something went wrong with removing it.')
                                            }
                                            var getservantlist = realpath.val();
                                            var checkexists = getKeyByValue(getservantlist,info.refPath)
                                            if(checkexists){
                                                db.ref('users/"'+info['author']+'"/servants/'+checkexists).remove();
    
                                                return msg.reply(`I have deleted the entry for \`${query}\`.`)
                                            }
                                        })
                                    }).catch(console.error);
                                    
                                }
                                else{
                                    return msg.reply(`I couldn't find \`${query}\`.`)
                                }
                            }
                            else{
                                return msg.reply(`You aren't the author of \`${query}\`!`)
                            }
                        });
                    }
                    else{
                        if(msg.author.id == info['author']){
                            if(info.refPath){
                                db.ref('wiki/'+info.refPath).remove();
                                if(info.nicknameTokens){
                                    for(i = 0;i<info.nicknameTokens.length;i++){
                                        db.ref('wiki/'+info.nicknameTokens[i]).remove();
                                    }
                                }
                                db.ref('servantlist').get().then((realpath) => {
                                    if(!realpath.exists()){
                                        return msg.reply('Something went wrong with removing it.')
                                    }
                                    var getservantlist = realpath.val();
                                    var checkexists = getKeyByValue(getservantlist,info.refPath)
                                    if(checkexists){
                                        db.ref('servantlist/'+checkexists).remove();
                                    }
                                    db.ref('users/"'+info['author']+'"/servants/').get().then((realpath) => {
                                        if(!realpath.exists()){
                                            return msg.reply('Something went wrong with removing it.')
                                        }
                                        var getservantlist = realpath.val();
                                        var checkexists = getKeyByValue(getservantlist,info.refPath)
                                        if(checkexists){
                                            db.ref('users/"'+info['author']+'"/servants/'+checkexists).remove();

                                            return msg.reply(`I have deleted the entry for \`${query}\`.`)
                                        }
                                    })
                                }).catch(console.error);
                                
                            }
                            else{
                                return msg.reply(`I couldn't find \`${query}\`.`)
                            }
                        }
                        else{
                            return msg.reply(`You aren't the author of \`${query}\`!`)
                        }
                    }
                    }
                }).catch((error) => {
                    console.error(error);
                });
              }
              
              
		}
		catch(err){
			return msg.reply('Error: '+err);
		}
	},
};