const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const fetch = require('node-fetch');
const filecharacterlimit = 100000;
const articlelimit = 15;
const pagelimit = 25;
const embedlimit = 10;
const messagelimit = 1800;
const sectionlimit = 25000;
const Discord = require('discord.js');
const sectionheaders = {
    image:'---|image',
    skill:'---|skill',
    character:'---|character',
    dialogue:'---|dialogue'
}
const basicheader = '---|Basic Information|---';
const nextheader = '---|';
const basicfields = ['truename','class','colour','attribute','alignment','gender','height','weight'
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
},'wikieditapp');

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
    returnval.push((body.slice(0,index) + ('' || '') + body.slice(endindex)).trim());
    return returnval;
}

function addToWiki(text,msg){
    
    try{
        //First validate that the important details are there, and throw an error if it is not.
        var basicInfo = popTag(text,basicheader,nextheader,2000)  //gather basic information, 2000 is limit
        var checkname = null;
        if(basicInfo){
            var trybasic = popTag(basicInfo[0],'|name','\n',250,regfield='|');
            if(trybasic){
                checkname = trybasic[0];  //set checked name
                //basicInfo[1] = trybasic[1].trim();
                basicInfo[0] = trybasic[1].trim();
            }
            else{
                trybasic = popTag(basicInfo[0],'name:','\n',250);
                if(trybasic){
                    checkname = trybasic[0];
                    basicInfo[0] = trybasic[1].trim();
                }
            }
        }
        else if(!checkname){
            var trimmed = text.trim();
            if(trimmed.indexOf('|') == 0){
                if(text.indexOf('|',1) == -1){
                    throw 'You did not seem to include a name.'
                }
                checkname = trimmed.substr(0,trimmed.indexOf('|',1));
                checkname = checkname.substr(1,checkname.length+1);  //trim pipes
            }
            else{
                //take up to first whitespace character
                var hasspace = trimmed.indexOf(' ');
                if(hasspace == -1){
                    hasspace = trimmed.length;
                }
                var hasnew = trimmed.indexOf('\n');
                if(hasnew == -1){
                    hasnew = trimmed.length;
                }
                else{
                    if(trimmed.substr(0,hasnew).indexOf('|') == -1){
                        hasspace = trimmed.length;  // if there are no tags in first row use newline
                    }
                }
                checkname = trimmed.substr(0,Math.min(hasspace,hasnew)).trim();
            }
            if(checkname.length < 1){
                
                    throw 'You did not seem to include a name.';
                
            }
            if(trimmed.toLowerCase().indexOf('name:') != -1){
                trybasic = popTag(text,'name:','\n',250);
                checkname = trybasic[0];
            
            }
            basicInfo = popTag(text,checkname,nextheader,2000);
            if(checkname.indexOf('|')!=-1){
                checkname = checkname.substr(0,checkname.length-1);
            }
        }

        text = basicInfo[1];  //remove popped portion
        basicInfo = basicInfo[0]; //change to popped portion only

        var basicFields = {};
        var trybasic;

        var db = admin.database();
        db.ref('wiki/'+checkname).get().then((namesnap) => {
            if(!namesnap.exists()){
                return msg.reply('That name does not exist in my database.');
            }
            var currentdata = namesnap.val()
            if(currentdata.length == 1){
                currentdata = currentdata[0];
            }
            else if(checkname.indexOf('/') == -1){
                if(Object.keys(currentdata).length > 1){
                    var searchoptions = '\n';
                    for (let i in currentdata) {
                        searchoptions += `${currentdata[i].truename} by <@${currentdata[i].author}>: \`p?wiki ${currentdata[i].refPath}\`\n`;
                    }
                    return msg.reply({content:`There was more than one result for \`${checkname}\`! Here are your options:`
                                    ,embeds:[new Discord.MessageEmbed().setDescription(searchoptions).setColor('#ffffff')]});
                }
            }
            else if(checkname.split('/').length() > 2){
                return msg.reply('The name included too many slashes.');
            }
            if(currentdata['author'] != msg.author.id){
                //make sure authors match
                return msg.reply('You are not the author of that servant!');
            }
            else if(currentdata['isRef'] == 'true'){
                //redirect nickname searches
                return msg.reply(`Please try again with the original registered name of this servant: \`p?wikiedit ${currentdata['refPath']}\``);
            }
            for(i=0;i<basicfields.length;i++){
                // load basic values
                trybasic = popTag(basicInfo,'|'+basicfields[i],'\n',250,regfield='|');
                if(!trybasic){
                    trybasic = popTag(basicInfo,basicfields[i]+':','\n',250);
                }
                if(!trybasic){
                    continue;
                }
                else if(trybasic[0] == ''){
                    basicInfo = trybasic[1];
                }
                else{
                    basicFields[basicfields[i]] = trybasic[0]
                    basicInfo = trybasic[1];
                }
            }
            if(basicInfo.trim().length > 0){
                //make sure to only update description if exists
                basicFields['description'] = basicInfo.trim();
            }
            
            if(basicFields['nickname']){
                basicFields['nickname'] = basicFields['nickname'].split(',');
                if(basicFields['nickname'].length > 10){
                    throw 'You can\'t have that many nicknames! They will be searchable.'
                }
                if(currentdata['nickname']){
                    var lowerSearch = basicFields['nickname'].map(name => name.toLowerCase());
                    for(i=0;i<currentdata['nickname'].length;i++){
                        if(!lowerSearch.includes(currentdata['nickname'][i])){
                            // remove nickname references that got removed
                            db.ref('wiki/'+currentdata['nickname'][i]+'/'+currentdata['refPath'].split('/').join('|')).remove();
                        }
                    }
                }
                //get true name somehow
                var nametruename;
                if(basicFields['truename']){
                    nametruename = basicFields['truename']
                }
                else if(currentdata['truename']){
                    nametruename =currentdata['truename']
                }
                else{
                    nametruename = currentdata['name']
                }
                for(i=0;i<basicFields['nickname'].length;i++){
                    var lowerNick = basicFields['nickname'][i].toLowerCase();
                    //validate length and not same as name
                    if(lowerNick != currentdata['name'] && lowerNick.length < 64 && lowerNick.length > 0){
                         db.ref('wiki/'+lowerNick+'/'+currentdata['refPath'].split('/').join('|')).set({author:String(msg.author.id),isRef:'true',
                                                                                            refPath:currentdata['refPath'],truename:nametruename});
                    }
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
                        tryfind = popTag(basicFields['stats'],tryfind,',',16)
                        if(tryfind){
                            newStat[key] = tryfind[0];
                            break;
                        }
                    }
                }
                basicFields['stats'] = newStat;
            }
            //then update info pages
            var newInfo;
            for(let j in sectionheaders){
                newInfo = popTag(text,sectionheaders[j],nextheader,sectionlimit,regfield='|---')
                var deletepages = [];
                var checkdelete = false;
                if(newInfo){
                    text = newInfo[1];  //remove popped portion
                    var saveInfo = newInfo[0];
                    checkdelete = popTag(newInfo[0],'|delete|','\n',16)
                    if(checkdelete){
                        newInfo[0] = checkdelete[1];
                        checkdelete = checkdelete[0].split(','); // split into numbers
                        for(i = 0;i<checkdelete.length;i++){
                            deletepages.push(checkdelete[i]);
                        }
                        //deletepages.push(checkdelete);  //push into delete stuff
                        if(deletepages.includes('all')){
                            deletepages = 'all';
                        }
                    }
                    var insertPages = [];
                    newInfo = newInfo[0].split('|page|'); //change to popped portion only
                    if(newInfo.length > pagelimit){
                        msg.reply(`Section \`${i}\` was not added, as you exceeded the maximum page limit.`)
                    }
                    else{
                        //check each page length does not go over limit
                        for(i=0;i<newInfo.length;i++){
                            var addinsert = false;
                            var tryinsert = popTag(newInfo[i],'|insert|','\n',16);
                            if(tryinsert){
                                newInfo[i] = tryinsert[1];
                                addinsert = tryinsert[0];
                                if(!Number.isInteger(Number(addinsert))){
                                    addinsert = false;
                                }
                            }
                            else{
                                tryinsert = popTag(newInfo[i],'|edit|','\n',16);
                                if(tryinsert){
                                    newInfo[i] = tryinsert[1];
                                    addinsert = tryinsert[0];
                                    if(!Number.isInteger(Number(addinsert))){
                                        addinsert = false;
                                    }
                                    else{
                                        deletepages.push(Number(addinsert));  //add to pages to be deleted
                                    }
                                }
                            }
                            var ifinsert = '';
                            if(addinsert){
                                ifinsert = '|insert|'+addinsert+'\n'
                            }
                            if(newInfo[i].length > messagelimit){
                                while(newInfo[i].length > messagelimit){
                                    var tryFind = newInfo[i].slice(messagelimit-250,messagelimit);
                                    var tryNewline = tryFind.lastIndexOf('\n');
                                    
                                    if(tryNewline >= 0){
                                        //if a newline is found
                                        insertPages.push(ifinsert+newInfo[i].slice(0,messagelimit-250+tryNewline));
                                        newInfo[i] = newInfo[i].slice(messagelimit-250+tryNewline);
                                        continue;
                                    }
                                    else{
                                        tryNewline = tryFind.lastIndexOf(' ')  //look for a space
                                        if(tryNewline >= 0){
                                            //if a space is found
                                            insertPages.push(ifinsert+newInfo[i].slice(0,messagelimit-250+tryNewline));
                                            newInfo[i] = newInfo[i].slice(messagelimit-250+tryNewline);
                                            continue;
                                        }
                                        else{
                                            insertPages.push(ifinsert+newInfo[i].slice(0,messagelimit));
                                            newInfo[i] = newInfo[i].slice(messagelimit);
                                        }
                                    }
                                }
                                insertPages.push(ifinsert+newInfo[i])
                            }
                            else{
                                insertPages.push(ifinsert+newInfo[i])
                            }
                        }
                        newInfo = insertPages;
                        insertPages = currentdata[j];  //copy current page array, CAN CHANGE THIS IF USER WANTS TO REPLACE
                        //add delete option like |delete|1,2,3... or |delete|all ^^^^^
                        if(!insertPages){
                            insertPages = [];
                        }
                        
                        //turn deleted ones to null
                        
                        var pageInserts = [];
                        if(deletepages == 'all'){
                            insertPages = [];
                            currentdata[j] = [];
                        }
                        else{
                            for(i=0;i<deletepages.length;i++){
                                deletepages[i] = Number(deletepages[i]);
                                if(Number.isInteger(deletepages[i])){
                                    insertPages[deletepages[i]] = null;  //change selected pages to null for later
                                }
                            }
                        }
                        
                        //do it again but for embeds
                        for(i=0;i<newInfo.length;i++){
                            
                            var addinsert = false;
                            var tryinsert = popTag(newInfo[i],'|insert|','\n',16);
                            if(tryinsert){
                                newInfo[i] = tryinsert[1];
                                addinsert = Number(tryinsert[0]);
                                if(!Number.isInteger(addinsert)){
                                    addinsert = false;
                                }
                                if(addinsert>currentdata[j].length){
                                    addinsert = false;
                                }
                                addinsert++;
                                for(insert=0;insert<pageInserts.length;insert++){
                                    if(pageInserts[insert]<addinsert){
                                        addinsert++;
                                    }
                                }
                            }
                            var tryEmbeds = newInfo[i].split('|embed|');
                            if(tryEmbeds.length > embedlimit){
                                while(tryEmbeds.length > embedlimit){
                                    if(addinsert){  //if inserting
                                        pageInserts.push(addinsert);
                                        insertPages.splice(addinsert,0,tryEmbeds.splice(0,10).join('|embed|'));
                                        addinsert++;
                                    }
                                    else{
                                        insertPages.push(tryEmbeds.splice(0,10).join('|embed|'))
                                    }
                                }
                                if(addinsert){  //if inserting
                                    pageInserts.push(addinsert);
                                    insertPages.splice(addinsert,0,tryEmbeds.join('|embed|'))
                                    addinsert++;
                                }
                                else{
                                    insertPages.push(tryEmbeds.join('|embed|'))
                                }
                            }
                            else{
                                if(addinsert){  //if inserting
                                    pageInserts.push(addinsert);
                                    insertPages.splice(addinsert,0,newInfo[i])
                                }
                                else{
                                    insertPages.push(newInfo[i])
                                    
                                }
                            }
                        }
                    }
                    //format each page depending on specifications
                    var filtered = insertPages.filter(function (el) {
                        return el != null && el != '';
                    });
                    //add formatted data to database
                    basicFields[j] = [null];
                    
                    basicFields[j] = basicFields[j].concat(filtered);
                    
                }
            }

            db.ref('wiki/'+currentdata['refPath']).update(basicFields);
            return msg.reply(`I have updated the wiki entry for \`${currentdata['name']}\`.`);
            
        }).catch(console.error);
    }catch(err){
        return msg.reply('Something went wrong: ' + err);
    }
    return;
}

module.exports = {
	name: 'wikiedit',
	data: new SlashCommandBuilder()
		.setName('wikiedit')
		.setDescription('???')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('query')
                .setRequired(false)),
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
            var textfile;
            if(args.length < 250 && isValidHttpUrl(args) && args.endsWith('.txt')){
                //If user sends via link
                fetch(args).then(r => r.text()).then(t => {
                    textfile = t;
                    if(textfile.length > filecharacterlimit){
                        throw 'Your file is too big! (You should never see this warning)';
                    }
                    addToWiki(textfile,msg);
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
                    addToWiki(textfile,msg);
                }).catch((error) => {
                    console.error(error);
                });
            }
            else{
                //If user sends via direct text
                textfile = args;
                addToWiki(textfile,msg);
            }
            return;

		}
		catch(err){
			return msg.reply(' '+err);
		}
		
		
	},
};