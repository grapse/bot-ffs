const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const fetch = require('node-fetch');
const filecharacterlimit = 100000;
const articlelimit = 15;
const pagelimit = 25;
const embedlimit = 10;
const messagelimit = 1800;
const sectionlimit = 25000;
const servantlimit = 50;
const sectionheaders = {
    image:'---|image',
    skill:'---|skill',
    character:'---|character',
    dialogue:'---|dialogue'
}
const basicheader = '---|Basic Information|---';
const nextheader = '---|';
const basicfields = ['name','truename','class','colour','attribute','alignment','gender','height','weight'
                    ,'artist','writer','stats','nickname','traits','icon','website'];
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
},'wikiaddapp');

function isValidHttpUrl(string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
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
    returnval.push(body.slice(0,index) + ('' || '') + body.slice(endindex));
    return returnval;
}

function addToWiki(text,msg,wikiclient){
    
    try{
        //First validate that the important details are there, and throw an error if it is not.
        var basicInfo = popTag(text,basicheader,nextheader,2000)  //gather basic information, 2000 is limit
        if(!basicInfo && text.toLowerCase().indexOf('name:') != -1){
            basicInfo = popTag(text,'',nextheader,2000);
        }
        else if(!basicInfo){
            throw 'I could not find a name. Make sure you use `Name: (insert name here)` so I know what to register it under!'
        }
        text = basicInfo[1];  //remove popped portion
        basicInfo = basicInfo[0]; //change to popped portion only
        var basicFields = {};
        var trybasic;
        for(i=0;i<basicfields.length;i++){
            // load basic values
            trybasic = popTag(basicInfo,'|'+basicfields[i],'\n',250,regfield='|');
            if(!trybasic){
                trybasic = popTag(basicInfo,basicfields[i]+':','\n',250);
            }
            if(!trybasic){
                basicFields[basicfields[i]] = null;
            }
            else if(trybasic[0].trim() == ''){
                basicFields[basicfields[i]] = null;
                basicInfo = trybasic[1];
            }
            else{
                basicFields[basicfields[i]] = trybasic[0]
                basicInfo = trybasic[1];
            }
        }
        basicFields['description'] = basicInfo + ' ';
        if(!basicFields['name']){
            throw 'You did not fill in a required field!'
        }
        else if(basicFields['name'].indexOf('/') != -1 || basicFields['name'].indexOf('|') != -1){
            throw 'You included a `/` or `|` in the name! This is not allowed.'
        }
        basicFields['name'] = basicFields['name'].toLowerCase();
        basicFields['author'] = msg.author.id;
        if(basicFields['nickname']){
            basicFields['nickname'] = basicFields['nickname'].split(',');
            if(basicFields['nickname'].length > 10){
                throw 'You can\'t have that many nicknames! They will be searchable.'
            }
        }
        //see if it already exists
        //format the stat and nickname data
        if(basicFields['stats']){
            var newStat = {AGI:'-',END:'-',LUK:'-',MP:'-',NP:'-',STR:'-'};
            const altnames = {AGI:['agility','agi','agl'],END:['endurance','end','con'],LUK:['luck','luk','luc'],
                              MP:['mp','mana','mgi','man'],NP:['np','noble phantasm'],STR:['str','atk','strength']};
            for(let key in newStat){
                for(i = 0;i<altnames[key].length;i++){
                    var tryfind = altnames[key][i];
                    tryfind = popTag(basicFields['stats'],tryfind+':',',',16)
                    if(tryfind){
                        newStat[key] = tryfind[0];
                        break;
                    }
                }
            }
            basicFields['stats'] = newStat;
        }
         //add bonus sections
        var newInfo;
        for(let j in sectionheaders){
            newInfo = popTag(text,sectionheaders[j],nextheader,sectionlimit,regfield='|---')
            if(newInfo){
                text = newInfo[1];  //remove popped portion
                var saveInfo = newInfo[0];
                var insertPages = [];
                newInfo = newInfo[0].split('|page|'); //change to popped portion only
                if(newInfo.length > pagelimit){
                    msg.reply(`Section \`${i}\` was not added, as you exceeded the maximum page limit.`)
                }
                else{
                    //check each page length does not go over limit
                    for(i=0;i<newInfo.length;i++){
                        if(newInfo[i].length > messagelimit){
                            while(newInfo[i].length > messagelimit){
                                var tryFind = newInfo[i].slice(messagelimit-250,messagelimit);
                                var tryNewline = tryFind.lastIndexOf('\n');
                                if(tryNewline >= 0){
                                    //if a newline is found
                                    insertPages.push(newInfo[i].slice(0,messagelimit-250+tryNewline));
                                    newInfo[i] = newInfo[i].slice(messagelimit-250+tryNewline);
                                    continue;
                                }
                                else{
                                    tryNewline = tryFind.lastIndexOf(' ')  //look for a space
                                    if(tryNewline >= 0){
                                        //if a space is found
                                        insertPages.push(newInfo[i].slice(0,messagelimit-250+tryNewline));
                                        newInfo[i] = newInfo[i].slice(messagelimit-250+tryNewline);
                                        continue;
                                    }
                                    else{
                                        insertPages.push(newInfo[i].slice(0,messagelimit));
                                        newInfo[i] = newInfo[i].slice(messagelimit);
                                    }
                                }
                            }
                            insertPages.push(newInfo[i])
                        }
                        else{
                            insertPages.push(newInfo[i])
                        }
                    }
                    newInfo = insertPages;
                    insertPages = [null]
                    //do it again but for embeds
                    for(i=0;i<newInfo.length;i++){
                        var tryEmbeds = newInfo[i].split('|embed|');
                        if(tryEmbeds.length > embedlimit){
                            while(tryEmbeds.length > embedlimit){
                                insertPages.push(tryEmbeds.splice(0,10).join('|embed|'))
                            }
                            insertPages.push(tryEmbeds.join('|embed|'))
                        }
                        else{
                            insertPages.push(newInfo[i])
                        }
                    }
                }
                //add formatted data to database
                basicFields[j] = insertPages;
            }
        }
        var nicknametruename = basicFields['name'];
        //for registering nicknames
        if(basicFields['truename']){
            nicknametruename = basicFields['truename'];
        }
        else{
            basicFields['truename'] = nicknametruename;
        }

        var db = admin.database();
        db.ref('wiki/'+basicFields['name']).get().then((servantsnapshot) =>{
            var wikipath = 'wiki/error';
            if(!servantsnapshot.exists()){
                wikipath = basicFields['name']+'/0';
            }
            else if(servantsnapshot.val().length > articlelimit){
                return msg.reply('There are already too many entries for that name! (You should not be seeing this error)')
            }
            else{
                wikipath = basicFields['name']+'/'+servantsnapshot.val().length;
            }
            basicFields['refPath'] = wikipath;
            db.ref('wiki/'+wikipath).set(basicFields);
            db.ref('servantlist').push().set(wikipath);   //PUT THESE BACK AFTER TESTING
            //add to author personal list
            db.ref('users/"'+ msg.author.id+'"/servants').push().set(wikipath);
            
            var nicknameTokens = [];
            if(basicFields['nickname']){
                for(i = 0;i<basicFields['nickname'].length;i++){
                    if(basicFields['nickname'][i].length < 64 && basicFields['nickname'][i].length > 0 && basicFields['nickname'][i].toLowerCase() != basicFields['name']){
                        var newLoc = basicFields['nickname'][i].toLowerCase();
                        db.ref('wiki/'+basicFields['nickname'][i].toLowerCase()+'/'+wikipath.split('/').join('|')).set({author:String(msg.author.id),isRef:'true',
                                                                refPath:wikipath,truename:nicknametruename});
                        nicknameTokens.push(newLoc+'/'+wikipath.split('/').join('|'));
                    }
                    else{
                        msg.reply(`Nickname \`${basicFields['nickname'][i]}\` was not added for being too long, or it was the same as the name.`)
                    }
                }
                db.ref('wiki/'+wikipath+'/nicknameTokens').set(nicknameTokens);
            }
            msg.reply('Adding your Servant to my database...');
            return wikiclient.commands.get('wiki').execute(msg,2,search=wikipath);
        }).catch(console.error);
    }catch(err){
        return msg.reply('Something went wrong: ' + err);
    }
    return;
}

module.exports = {
	name: 'wikiadd',
	data: new SlashCommandBuilder()
		.setName('wikiadd')
		.setDescription('???')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('query')
                .setRequired(false)),
	async execute(msg,source,wikiclient) {
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
                
                args = interaction.data.options;
			}
			else{
                user = msg.author;
                
                
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
				
			}
            var db = admin.database()
                db.ref('users/"'+user.id+'"/servants').get().then((usersnapshot) => {
                    if(usersnapshot.exists()){
                        if(Object.keys(usersnapshot.val()).length > servantlimit){
                            return msg.reply('You have exceeded the maximum number of allowed Servants!')
                        }
                    }
                    
               
            var textfile;
            if(args.length < 250 && isValidHttpUrl(args) && args.endsWith('.txt')){
                //If user sends via link
                fetch(args).then(r => r.text()).then(t => {
                    textfile = t;
                    if(textfile.length > filecharacterlimit){
                        throw 'Your file is too big! (You should never see this warning)';
                    }
                    addToWiki(textfile,msg,wikiclient);
                })
            }
            else if(msg.attachments.size > 0){
                //If user sends via attachment
                const file = msg.attachments.first()?.url;
                if (!file || !file.endsWith('.txt')) throw 'Invalid file. Make sure it is a .txt file.';
                fetch(file).then(r => r.text()).then(t => {
                    textfile = t;
                    if(textfile.length > filecharacterlimit){
                        throw 'Your file is too big! (You should never see this warning)';
                    }
                    addToWiki(textfile,msg,wikiclient);
                }).catch((error) => {
                    console.error(error);
                });
            }
            else{
                //If user sends via direct text
                textfile = args;
                addToWiki(textfile,msg,wikiclient);
            }
            return;
        }).catch(console.error);

		}
		catch(err){
			return msg.reply(' '+err);
		}
		
		
	},
};