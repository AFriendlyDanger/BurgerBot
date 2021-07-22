console.log('Starting Bot...');

require('dotenv').config();

let burgerRE = /(\s|^)!burg(e|o)r(\s|$)/i
let mcdonRE = /(\s|^)!(m|w)cdonald('*s|s*)(\s|$)/i
let bkRE = /(\s|^)!burger_*king(\s|$)/i
let wendyRE = /(\s|^)!wendy'*s(\s|$)/i
let burgerTag = 'burger'
let mcTag = 'mcdonald\'s'
let bkTag = 'burger_king'
let wenTag = 'wendy\'s'

let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`
let gelImages = 'https://img3.gelbooru.com/images/'
//let tags = 'tags=burger+rating%3asafe+sort%3arandom'
let safeSearchTag = 'rating%3asafe+sort%3arandom'

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
    var content = msg.content;
    var tag = ''
    switch(true)
    {
        case burgerRE.test(content):
            tag = burgerTag;
            break;
        case mcdonRE.test(content):
            tag = mcTag;
            break;
        case bkRE.test(content):
            tag = bkTag;
            break;
        case wendyRE.test(content):
            tag = wenTag;
            break;
    }
    if (tag != ''){
        let post = await getImage(tag);
        msg.channel.send(post)
        return;
    }
    // if (burgerRE.test(msg.content)){
    //     //msg.channel.send("Under construction")
    //     let post = await getImage();
    //     msg.channel.send(post)
    //     return;
    // }
}

async function getImage(tag = 'burger'){
    let tags = `tags=${tag}+${safeSearchTag}`;
    let url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&${tags}&limit=1&pid=1${gelAuth}`;
    let response = await fetch(url);
    if (!response.ok) {
        return ('Unable to grill, come back later.');
    }
    let json = await response.json();
    let dir = json[0].directory;
    let img = json[0].image;
    return (`${gelImages}${dir}/${img}`)
}