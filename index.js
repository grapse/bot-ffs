const fs = require('fs');
const { Client, Collection, DiscordAPIError } = require('discord.js');
require('dotenv').config()
const token = process.env.TOKEN;
const firebaseAdminKey = process.env.firebaseAdminKey;
const { MessageEmbed } = require('discord.js');
const cron = require('cron');
const Discord = require('discord.js');

const client = new Client({ intents: ["GUILDS", "DIRECT_MESSAGES","GUILD_MESSAGES","GUILD_MESSAGE_REACTIONS","DIRECT_MESSAGE_REACTIONS"]
							,partials: ["CHANNEL","MESSAGE","REACTION"] });
const prefix = 'p?';

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Initialize Firebase----------------------------------
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./ffs-bot-4432a48dc561.json");
serviceAccount['private_key'] = process.env.private_key.replace(/\\n/g, '\n');

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ffs-bot-default-rtdb.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: firebaseAdminKey
  }
});

//---------------------------------------------------
//Server specifics
const submissionchannel = '854272406529245196'
const modchannel = '855591311046606918'
const botchannel = '855720576529334272'
const pointmessage = '857520219999305728'
const announcementchannel = '854272472727420968'
const startdate = new Date(2021,6,21,15);
const storagechannel = '857519718936084510'
const botid = '855212596743372811'
const nachannel = '679889032884387852'


//Functions----------------------------------
function unreact(user,feverpoints,message){
  if(user.id in feverpoints){
                feverpoints[user.id] +=1 ;
                message.edit(JSON.stringify(feverpoints));
            }
}
//find nth occurence of substring
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

//Embeds
function makeEmbed(text){
    if(text.startsWith('p?') || text.startsWith('aq') || text.startsWith('addquote')){
      text = text.substring(nthIndex(text,' ',2));
    }

    var embedargs = text.split("|");
    var embedColor = '#000000';
    var embedTitle = ' ';
    if(embedargs.length > 2){
        embedTitle = embedargs[2]
        if(embedargs.length > 3){
            embedColor = embedargs[3];
        }
    }
    const newembed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle(embedTitle)
        .setDescription(embedargs[0]+' ')
        .setImage(embedargs[1])
    return newembed
}

function handlePts(messageReaction,user,feverpoints,client,message){
  if(user.id in feverpoints){  
                if(feverpoints[user.id] > 0){
                    feverpoints[user.id] -= 1;
                    //update message
                    var modchannelobj = client.channels.cache.get(storagechannel);
                    message.edit(JSON.stringify(feverpoints));
                }
                else{
                    feverpoints[user.id] -=1;
                    client.channels.cache.get(botchannel).send(`You are out of points, <@${user.id}>~! Try unreacting to previous works if you want your budget back.`);
                    messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
                    message.edit(JSON.stringify(feverpoints));
                }
            }
            else{  // Otherwise add to the dict
                feverpoints[user.id] = 14;  // Starts with 7 because 1 has been used just now
                //update message
                message.edit(JSON.stringify(feverpoints));
            }
}

//-----------------------------------------------------


client.once('ready', () => {
	console.log('Ready!a');
    const scheduledMessage = new cron.CronJob('00 00 03 * * *', function() {
		// Specifing your guild (server) and your channel
		   client.channels.cache.get(nachannel).send(`<@&${'835447374519730178'}> Don't forget to log in!`);
		  });
			  
		  // When you want to start it, use:
		  scheduledMessage.start();
		  //console.log('test');
});

client.on('interactionCreate', async interaction => {
	// Handle slash commands
	//console.log('test');
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction,1);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', message => {
	//handle point react
	if (message.channel.id === submissionchannel) {
        const reactionEmoji = '<:FeverPoint:854957388805177348>'//message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
		message.react(reactionEmoji);}
		
	//console.log('test1');
	const msg = message.content;
	if(msg.startsWith(prefix)){
		//slice prefix and all arguments
		//take up to first whitespace character
		var hasspace = msg.indexOf(' ');
		if(hasspace == -1){
			hasspace = msg.length;
		}
		var hasnew = msg.indexOf('\n');
		if(hasnew == -1){
			hasnew = msg.length;
		}
		var checkcharacter = ' '
		if(hasnew < hasspace){
			checkcharacter = '\n'
		}
		const usercommand = msg.substr(prefix.length).split(checkcharacter)[0];
		//console.log(usercommand)
		//console.log(usercommand);
		try{
			const command = client.commands.get(usercommand);
			command.execute(message,0,wikiclient=client);
		} catch(error){
			return message.reply('That is not a valid command!'+error);
		}

	}
	//Handle Quotes--------------------------------------------------------------------     
	if(msg.startsWith('p!')){
		var searchKey = message.content.substring(2).toLowerCase();
		var quoteRef = admin.database().ref('quotes/'+searchKey);
		//console.log(quoteRef);
		quoteRef.on('value', (snapshot) => {
		  	if(snapshot.exists()){
				var quoteData = snapshot.val();
				var channelobj = client.channels.cache.get(quoteData.cid);
				//console.log(quoteData.cid);
				if(['wikitemplate'].includes(searchKey)){
					channelobj.messages.fetch(quoteData.mid)
					.then(m => {
                        var messagecontents = m.content.split('|split|')
                        message.reply({embeds:[new Discord.MessageEmbed().setDescription(messagecontents[0]).setImage(messagecontents[1])]});
                
                    })
					.catch(console.error);
				}
				else{
                    try{
                        channelobj.messages.fetch(quoteData.mid)
				.then(m => message.reply({embeds:[makeEmbed(m.content)]}))
				.catch(console.error);
                    }
                    catch{
                        message.reply({content:'I could not find the quote. The original message or channel was deleted.'})
                    }
					
				}
			}
			else{
				message.reply("I don't think that is a valid quote.");
			}
		
		});
		
	  }
});

client.on("messageReactionAdd", function(messageReaction, user) {
    // only need if the reaction is not by bot & fever point emoji & in the right channel 
    const reactionEmoji = '<:FeverPoint:854957388805177348>';//messageReaction.message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
    if(user.id != botid && messageReaction.emoji === reactionEmoji
        && messageReaction.message.channel.id === submissionchannel){
        //if user does not have the role, remove it
        // fetch member from ID
        let User = messageReaction.message.guild.members.cache.get(user.id);
        var current = new Date();
        if(current < startdate){
            client.channels.cache.get(botchannel).send(`The main event has not yet started, <@${user.id}>! Check <#${announcementchannel}> for the starting date~`);
            messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
        }
        else if(User.roles.cache.some(r=>r.name==="🎸Summer Event")){
            // if budget is 1 or more, remove from budget. otherwise, remove reaction and warn user
            var modchannelobj = client.channels.cache.get(storagechannel);
                    modchannelobj.messages.fetch(pointmessage)
                        .then(message => handlePts(messageReaction,user,JSON.parse(message.content),client,message))
                        .catch(console.error);
            
        }
        else{  // remove the reaction
            client.channels.cache.get(botchannel).send(`You are not part of the event, <@${user.id}>! Check <#${announcementchannel}> for details and how to join~`);
            messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
        }
    }
    
});

// Add point back if unreacted
// Handle point budgets
client.on("messageReactionRemove", function(messageReaction, user){
    // only need if the reaction is not by bot & fever point emoji & in the right channel 
    const reactionEmoji ='<:FeverPoint:854957388805177348>'// messageReaction.message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
    if(user.id != '855212596743372811' && messageReaction.emoji === reactionEmoji
        && messageReaction.message.channel.id === submissionchannel){
        // add point back
        try{
            var modchannelobj = client.channels.cache.get(storagechannel);
                modchannelobj.messages.fetch(pointmessage)
                    .then(message => unreact(user,JSON.parse(message.content),message))
                    .catch(console.error);
                
        }
        catch{
            client.channels.cache.get(modchannel).send(`Something went wrong with <@${user.id}>'s react.`);
        }
        
    }
    
});
client.login(process.env.TOKEN);