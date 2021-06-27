console.log('ayoo');

require('dotenv').config();

let burgerRE = /(\s|^)!burger(\s|$)/i

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN)

client.on('ready', botReady );

function botReady(){
    console.log('Bot Ready');
}

client.on('message', gotMessage);

function gotMessage(msg){
    if(msg.author.bot){
        return;
    }
    if (burgerRE.test(msg.content)){
        msg.channel.send("Under construction")
        return;
    }
}