console.log('Starting Bot...');

require('dotenv').config();

let burgerRE = /(\s|^)!burger(\s|$)/i
let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`
let gelImages = 'https://img3.gelbooru.com/images/'
let tags = 'tags=burger+rating%3asafe+sort%3arandom'

const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOTTOKEN)

client.on('ready', botReady );

function botReady(){
    console.log('Bot Ready');
    client.user.setActivity("!burger", {type: "WATCHING"})
}

client.on('message', gotMessage);

async function gotMessage(msg){
    if(msg.author.bot){
        return;
    }
    if (burgerRE.test(msg.content)){
        //msg.channel.send("Under construction")
        let post = await getImage();
        msg.channel.send(post)
        return;
    }
}

async function getImage(){
    let url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&${tags}&limit=1&pid=1${gelAuth}`;
    let response = await fetch(url);
    if (!response.ok) {
        return ('Unable to grill, come back later.')
    }
    let json = await response.json();
    let dir = json[0].directory;
    let img = json[0].image;
    return (`${gelImages}${dir}/${img}`)
}