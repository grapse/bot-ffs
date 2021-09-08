const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

require('dotenv').config()
//Firebase----------------------------------
const firebaseAdminKey = process.env.firebaseAdminKey;

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("../ffs-bot-49e0ca636b9d.json");
serviceAccount['private_key'] = process.env.private_key.replace(/\\n/g, '\n');

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ffs-bot-default-rtdb.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: firebaseAdminKey
  }
},'wikiapp');
const classes = ['saber','archer','lancer','caster','rider','assassin','berserker','avenger','ruler',
                'foreigner','shielder','pretender'];
// Functions---------------------------
var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
}

function popTag(body,tag,end,checklength,regfield=0){
    // 0th index is popped, 1st is remaining
    // checklength depends on tag
    var returnval = [];
    var index = body.toLowerCase().indexOf(tag.toLowerCase());
    if(regfield != 0){
        tag = body.slice(index,body.indexOf(regfield,index+1)+regfield.length)
    }
    if(index < 0){
        // tag does not exist, no need to splice/pop
        return null;
    }
    else{
        var endindex = body.indexOf(end,index+tag.length);
        if(endindex == -1){
            //end of file
            endindex = body.length;
        }
        if(endindex - index > checklength){
            // If it is too long to be properly used
            return null;
        }
    }
    returnval.push(body.slice(index+tag.length,endindex).trim());
    returnval.push((body.slice(0,index) + ('' || '') + body.slice(endindex)).trim());
    return returnval;
}

function makeEmbed(msg,text,user,type,page,pagecount){
    //truename: home screen with class and stats, etc
    //image: image screen

    //page is the page for images, etc. home does not have pages usually
    var newembed;
    try{
        switch (type){
        case 'truename':
            //figure out class emoji lol
            var classsearch = 'default';
            if(text['class']){
                classsearch = text['class'].toLowerCase()
            }
            var searchemoji = 'class_'
            if(classes.includes(classsearch)){
                searchemoji+= classsearch;
            }
            else{
                switch(classsearch){
                    case 'alter-ego':
                    case 'alter ego':
                    case 'alterego':
                        searchemoji+='alterego';
                        break;
                    case 'mooncancer':
                    case 'moon cancer':
                        searchemoji +='mooncancer';
                        break;
                    case 'faker':
                        searchemoji += 'pretender';
                        break;
                    case 'gunner':
                        searchemoji += 'archer'
                        break;
                    default:
                        searchemoji+='all'
            }}
            var classemoji = msg.client.emojis.cache.find(emoji => emoji.name === searchemoji);

            newembed = new Discord.MessageEmbed()
            .setDescription(' ')
            .setColor('#ffffff')
            .setTitle(`${classemoji} `)
            .setAuthor(user.username,user.avatarURL())
            .setFooter('Use buttons for navigation.',msg.author.avatarURL());
            if(text['description']){
                newembed.setDescription(text['description'])
            }
            if(text["colour"]){
                newembed.setColor(text["colour"])
            }
            if(text["truename"]){
                newembed.setTitle(`${classemoji} ${text['truename']}`)
            }
            if(text["icon"]){
                newembed.setThumbnail(text["icon"])
            }
            if(text['writer']){
                if(Number.isInteger(Number(text['writer']))){
                    text['writer'] = `<@${text['writer']}>`;
                }
            }
            if(text['artist']){
                if(Number.isInteger(Number(text['artist']))){
                    text['artist'] = `<@${text['artist']}>`;
                }
            }
            const optionalattributes = ['attribute','alignment','gender','height','weight'
            ,'artist','writer','nickname','traits'];
            const optionalattributesDisplay = ['Attribute','Alignment','Gender','Height','Weight'
            ,'Artist','Writer','AKA','Traits'];
            var attributetext = '';
            for(i = 0;i<optionalattributes.length;i++){
                if(text[optionalattributes[i]]){
                    attributetext += optionalattributesDisplay[i] + ': ' + text[optionalattributes[i]] + '\n';
                }
            }
            if(attributetext.length != 0){
                newembed.addFields({name:'Attributes',value:attributetext});
            }
            if(text['stats']){
                newembed.addFields(
                    { name: 'Stats', 
                    value: `STR: ${text["stats"]["STR"]}\nEND: ${text["stats"]["END"]}\nAGI: ${text["stats"]["AGI"]}`, 
                    inline: true },
                    { name: '\u200B', 
                    value: `MP: ${text["stats"]["MP"]}\nLUK: ${text["stats"]["LUK"]}\nNP: ${text["stats"]["NP"]}`, 
                    inline: true },
                )
            }
            break;
        case 'image':
        case 'skill':
        case 'dialogue':
        case 'character':
            newembed = []
            var currembed;
            var currentpage = text[type][page].split('\\n').join('\n').split('|embed|');
            for(i = 0; i < currentpage.length; i++){
                currembed = new Discord.MessageEmbed()
                    .setColor(text['colour'])
                    .setDescription(currentpage[i]+' ');
                    
                if(i == 0){
                    currembed.setAuthor(user.username,user.avatarURL());
                }
                if(i == currentpage.length - 1){
                    currembed.setFooter(`Page ${page}/${pagecount}`,msg.author.avatarURL());
                }
                //check for added variables
                var check = popTag(currentpage[i],'|title|','\n',250);
                if(!check){
                    check = popTag(currentpage[i],'title:','\n',250);
                }
                if(check){
                    currembed.setTitle(check[0]);
                    currembed.setDescription(check[1]);
                    currentpage[i] = check[1];
                }
                check = popTag(currentpage[i],'|image|','\n',250);
                if(!check){
                    check = popTag(currentpage[i],'image:','\n',250);
                }
                if(check){
                    currembed.setImage(check[0]);
                    currembed.setDescription(check[1]);
                    currentpage[i] = check[1];
                }
                check = popTag(currentpage[i],'|icon|','\n',250);
                if(!check){
                    check = popTag(currentpage[i],'icon:','\n',250);
                }
                if(check){
                    currembed.setThumbnail(check[0]);
                    currembed.setDescription(check[1]);
                    currentpage[i] = check[1];
                }   
                newembed.push(currembed);
                
            }
            return newembed.slice(0,10);

            break;
    }
        return [newembed]
    }
    catch(err){
        //just in case
        return(new Discord.MessageEmbed().setTitle('Error').setDescription(`Somebody messed up!\n\`${err+' '}\``).setThumbnail('https://cdn.discordapp.com/attachments/489543528393998346/879971861746815016/3pensive.png'))
    }
    
}

function handleButtons(usermsg,botmsg,info,user){
    //handle buttons and edit into new embeds
    //botmsg.edit('test');
    const collector = botmsg.createMessageComponentCollector({ componentType: 'BUTTON', time: 120000 });
    var currentpage = 1;
    var currentview = 'truename';
    const buttontypes = ['image','skill','dialogue','character'];
    const counts = {};

    const image = new Discord.MessageButton()
        .setCustomId('image')
        .setLabel('Notes & Images')
        .setStyle('PRIMARY');
    const skill = new Discord.MessageButton()
        .setCustomId('skill')
        .setLabel('Abilities')
        .setStyle('PRIMARY');
    const character = new Discord.MessageButton()
        .setCustomId('character')
        .setLabel('Character')
        .setStyle('PRIMARY');
    const dialogue = new Discord.MessageButton()
        .setCustomId('dialogue')
        .setLabel('Dialogue')
        .setStyle('PRIMARY');
    const forward = new Discord.MessageButton()
        .setCustomId('forward')
        .setLabel('➡️')
        .setStyle('PRIMARY');
    const backward = new Discord.MessageButton()
        .setCustomId('backward')
        .setLabel('⬅️')
        .setStyle('PRIMARY');
    const home = new Discord.MessageButton()
        .setCustomId('home')
        .setLabel('↩️')
        .setStyle('SECONDARY');
    var website = new Discord.MessageButton()
        .setLabel('See More')
        .setURL('https://discord.gg/EwEps3x')
        .setStyle('LINK')
    if(info['website']){
        website.setURL(info['website'])
    }
    else{
        website.setDisabled()
    }
    const buttons = [image,skill,dialogue,character];
    for(i = 0;i < buttontypes.length;i++){
        if(!info[buttontypes[i]]){
            buttons[i].setDisabled();
        }
        else{
            counts[buttontypes[i]] = info[buttontypes[i]].length-1;
        }
    }
    //const row = new Discord.MessageActionRow();

  collector.on('collect', i => {
    //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
    if (i.user.id === usermsg.author.id) {
        collector.resetTimer();  // so user doesn't timeout
        switch(i.customId){
            case 'forward':
                currentpage +=1;
                if(currentpage == counts[currentview]){
                    // disabled forward button on second last page
                    forward.setDisabled();
                }
                if(currentpage == 2){
                    // re enable backward button as navigating away from 1st page
                    backward.setDisabled(false);
                }
                botmsg.edit({content:' ',embeds:makeEmbed(usermsg,info,user,currentview,currentpage,counts[currentview]),
                components:[new Discord.MessageActionRow().addComponents(home,backward,forward)]});
                break;
            case 'backward':
                currentpage -= 1;
                if(currentpage == 1){
                    // disable backward navigating to 1st
                    backward.setDisabled();
                }
                if(currentpage == counts[currentview] - 1){
                    //reenable forward if we're on last page
                    forward.setDisabled(false);
                }
                botmsg.edit({content:' ',embeds:makeEmbed(usermsg,info,user,currentview,currentpage,counts[currentview]),
                components:[new Discord.MessageActionRow().addComponents(home,backward,forward)]});
                break;
            case 'home':
                currentpage = 1;
                currentview = 'truename';
                botmsg.edit({content:' ',embeds:makeEmbed(usermsg,info,user,'truename',0,0),
                components:[new Discord.MessageActionRow().addComponents(image,skill,character,dialogue,website)]})
                break;
            case 'image':
            case 'skill':
            case 'character':
            case 'dialogue':
            default:
                currentview = i.customId;
                if(counts[currentview] > 1){
                    //diasble forward if only one page
                    forward.setDisabled(false);
                }
                else{
                    forward.setDisabled();
                }
                backward.setDisabled();
                botmsg.edit({content:' ',embeds:makeEmbed(usermsg,info,user,currentview,currentpage,counts[currentview]),
                components:[new Discord.MessageActionRow().addComponents(home,backward,forward)]});

                //don't break and fall into default
                //it also works for text because you can split them server end via count + above function
                break;
        }
        i.deferUpdate();
    } else {
      i.reply({ content: `<@${i.user.id}>, You cannot navigate someone else's search! Please make your own with \`p?wiki\`.`, ephemeral: true });
    }
  });

  collector.on('end', collected => {
    botmsg.edit({content:'As you have been idle for more than 2 minutes, this wiki search has timed out. Use `p?wiki` again to navigate pages.',components:[]});
  });

}

function handleWiki(msg,info,user){
  //fetch id of message bot sends through promise so it can handle
  var websitebutton = new Discord.MessageButton()
          .setLabel('See More')
          .setURL('https://discord.gg/EwEps3x')
          .setStyle('LINK')
  if(info['website']){
        websitebutton.setURL(info['website'])
    }
    else{
        websitebutton.setDisabled()
    }
  const row = new Discord.MessageActionRow()
  .addComponents(
      new Discord.MessageButton()
          .setCustomId('image')
          .setLabel('Notes & Images')
          .setStyle('PRIMARY'),
      new Discord.MessageButton()
          .setCustomId('skill')
          .setLabel('Abilities')
          .setStyle('PRIMARY'),
      new Discord.MessageButton()
          .setCustomId('character')
          .setLabel('Character')
          .setStyle('PRIMARY'),
      new Discord.MessageButton()
          .setCustomId('dialogue')
          .setLabel('Dialogue')
          .setStyle('PRIMARY'),
      websitebutton
  );
  
  for(let i = 0;i < row.components.length-1;i++){
        if(!info[row.components[i].customId]){
            row.components[i].setDisabled()
        }
  }

  msg.reply({content:' ',embeds:makeEmbed(msg,info,user,'truename',0,0),components: [row]})
    .then((m) => handleButtons(msg,m,info,user))
    .catch(console.error);
  
}


//--------------------------------------

module.exports = {
	name: 'wiki',
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('???')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('query')
                .setRequired(true)),
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
                
                    return msg.reply('The wiki is not available via slash command yet!')
                
                args = interaction.data.options[0];
			}
			else{
                user = msg.author;
               
                ///*
                var hasspace = msg.content.indexOf(' ');
                if(hasspace == -1){
                    hasspace = msg.content.length;
                }
                var hasnew = msg.content.indexOf('\n');
                if(hasnew == -1){
                    hasnew = msg.content.length;
                }//*/
                var checkcharacter = ' '
                ///*
                if(hasnew < hasspace){
                    checkcharacter = '\n'
                }//*/
                
				args = msg.content.substr(msg.content.indexOf(checkcharacter) + 1);
                if(args.length < 1){
                    return msg.reply('Please include a search, or use `p?wiki random` for a surprise! \nIf you would like to add your own Servants, please use `p?wikitemplate` for more info!')
                }
			}
            //msg.reply(args.toString());

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
              if(query == 'random'){
                  //handle random search
                  ///*
                    db.ref('servantlist').get().then((servantsnapshot) =>{
                        var servants = servantsnapshot.val();
                        var randomservant = randomProperty(servants);
                        
                        db.ref('wiki/'+randomservant).get().then((realpath) => {
                            if(!realpath.exists()){
                                return msg.reply(`Something went wrong with \`${query}/${searchnumber}\`.`);;
                            }
                            var info = realpath.val();
                            msg.client.users.fetch(info['author']).then((user) => {
                                handleWiki(msg,info,user)
                            }).catch(console.error);
                        }).catch(console.error);
                    }).catch(console.error);/**/
                    
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
                            msg.client.users.fetch(info['author']).then((user) => {
                                handleWiki(msg,info,user)
                            }).catch(console.error);
                        });
                    }
                    else{
                            msg.client.users.fetch(info["author"]).then((user) => {
                                handleWiki(msg,info,user)
                            }).catch(console.error);
                    }
                    }
                }).catch((error) => {
                    console.error(error);
                });
              }
              
              
		}
		catch(err){
			return msg.reply(err);
		}
		
		
	},
};