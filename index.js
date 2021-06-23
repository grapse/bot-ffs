const commando = require('discord.js-commando')
const path = require('path')
const sqlite = require('sqlite')
require('dotenv').config()
const client = new commando.CommandoClient({
    owner: '195688819821903872', // Your ID here.
    commandPrefix: 'p?', // The prefix of your bot.
    partials: ['MESSAGE','REACTION'],
    unknownCommandResponse: false, // Set this to true if you want to send a message when a user uses the prefix not followed by a command
})
//Server specifics
global.submissionchannel = '854272406529245196'
global.modchannel = '855591311046606918'
global.botchannel = '855720576529334272'
global.pointmessage = '857175990172909629'
global.infomessage = '857175999485444116'
global.storychannel = '854272472727420968'
global.announcementchannel = '854272472727420968'
global.pointemoji = '855534976900923413'
//Point balances
global.feverpoints = {};
global.info = {};
global.startdate = new Date(2021,4,21,15);

client.registry.registerDefaults()
	.registerGroups([
        ['test', 'usercommands']
	])
	.registerCommandsIn(path.join(__dirname,"commands"))

client.on('ready',()=>{
    console.log(`Logged in and ready to be used.. use "${client.commandPrefix}help".`)
    modchannelobj = client.channels.cache.get(modchannel);
    modchannelobj.messages.fetch(pointmessage)
        .then(message => feverpoints = JSON.parse(message.content))
        .catch(console.error);
    modchannelobj.messages.fetch(infomessage)
        .then(message => info = JSON.parse(message.content))
        .catch(console.error);
})

// For reacts
client.on('message', message => {
	if (message.channel.id === submissionchannel) {
        const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
		message.react(reactionEmoji);
	}
});

// Handle point budgets
client.on("messageReactionAdd", function(messageReaction, user){
    // only need if the reaction is not by bot & fever point emoji & in the right channel 
    const reactionEmoji = messageReaction.message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
    if(user.id != '855212596743372811' && messageReaction.emoji === reactionEmoji
        && messageReaction.message.channel.id === submissionchannel){
        //if user does not have the role, remove it
        // fetch member from ID
        let User = messageReaction.message.guild.member(client.users.cache.get(user.id));
        var current = new Date();
        if(current < startdate){
            client.channels.cache.get(botchannel).send(`The main event has not yet started, <@${user.id}>! Check <#${announcementchannel}> for the starting date~`);
            messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
        }
        else if(User.roles.cache.some(r=>r.name==="🎸Summer Event")){
            // if budget is 1 or more, remove from budget. otherwise, remove reaction and warn user
            if(user.id in feverpoints){  
                if(feverpoints[user.id] > 0){
                    feverpoints[user.id] -= 1;
                    //update message
                    modchannelobj = client.channels.cache.get(modchannel);
                    modchannelobj.messages.fetch(pointmessage)
                        .then(message => message.edit(JSON.stringify(feverpoints)))
                        .catch(console.error);
                }
                else{
                    feverpoints[user.id] -=1;
                    client.channels.cache.get(botchannel).send(`You are out of points, <@${user.id}>~! Try unreacting to previous works if you want your budget back.`);
                    messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
                }
            }
            else{  // Otherwise add to the dict
                feverpoints[user.id] = 7;  // Starts with 7 because 1 has been used just now
                //update message
                modchannelobj = client.channels.cache.get(modchannel);
                modchannelobj.messages.fetch(pointmessage)
                    .then(message => message.edit(JSON.stringify(feverpoints)))
                    .catch(console.error);
            }
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
    const reactionEmoji = messageReaction.message.guild.emojis.cache.find(emoji => emoji.name === 'FeverPoint');
    if(user.id != '855212596743372811' && messageReaction.emoji === reactionEmoji
        && messageReaction.message.channel.id === submissionchannel){
        // add point back
        try{
            if(user.id in feverpoints){
                feverpoints[user.id] +=1 ;
            }
        }
        catch{
            client.channels.cache.get(modchannel).send(`Something went wrong with <@${user.id}>'s react.`);
        }
        
    }
    
});

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
client.login(process.env.TOKEN)