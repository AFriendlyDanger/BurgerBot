console.log('Starting Bot...');

require('dotenv').config();


let burgerRE = /(\s|^)!burg(e|o)r(\s|$)/i
let mcdonRE = /(\s|^)!(m|w)cdonald('*s|s*)(\s|$)/i
let bkRE = /(\s|^)!burger_*king(\s|$)/i
let wendyRE = /(\s|^)!wendy'*s(\s|$)/i
let burgerTag = 'burger';
let mcTag = 'mcdonald\'s';
let bkTag = 'burger_king';
let wenTag = 'wendy\'s';

let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
let gelImages = 'https://img3.gelbooru.com/images/';
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
let safeSearchTag = 'rating%3asafe+sort%3arandom';

const guildId = process.env.GUILD_ID;
const fs = require('node:fs');
const fetch = require('node-fetch');

//database connection
const db = require("./db");
const scheduler = require("./follow-schedule");
//const Discord = require('discord.js');
const {Client, Collection, Intents} = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ] 
});

client.commands = new Collection();
client.login(process.env.BOTTOKEN);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.on('ready', botReady );

function botReady(){
    //console.log('Bot Ready');
    client.user.setActivity("!burger", {type: "WATCHING"})
    //愛 LIKE ハンバーガー 🍔 (Ai LIKE Hamburger 🍔)
    dbSetup();
}

//client.on('messageCreate', gotMessage);

async function gotMessage(msg){
    if(msg.author.bot){
        return;
    }
    var content = msg.content;
    var tag = '';
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
        msg.channel.send(post);
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
    //console.log(url)
    let response = await fetch(url);
    if (!response.ok) {
        return ('Unable to grill, come back later.');
    }
    let json = await response.json();
    //let dir = json.post[0].directory;
    //let img = json.post[0].image;
    //return (`${gelImages}${dir}/${img}`);
    return(json.post[0].file_url)
}



client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;
    //console.log("command")
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

function dbSetup(){

    let sql = 'CREATE TABLE if not exists `schedule` (`guild_id` VARCHAR(255) NOT NULL, ' +
        '`channel_id` VARCHAR(255) NOT NULL, ' +
        '`scheduled_time` TIME NOT NULL, ' +
        '`active` TINYINT NOT NULL DEFAULT 0, ' +
        '`failed_posts` INT NOT NULL DEFAULT 0, ' +
        'PRIMARY KEY (`channel_id`));';
        //sql = 'select * from schedule'
    db.executeQuery(sql)
    .then(rows =>{
        sql = 'CREATE TABLE if not exists `servings` (' +
        '`guild_id` VARCHAR(255) NOT NULL, ' +
        '`channel_id` VARCHAR(255) NOT NULL, ' +
        '`burgers` INT NOT NULL DEFAULT 0, ' +
        'PRIMARY KEY (`channel_id`));';
        db.executeQuery(sql)
        .catch((err) => {throw err});
        })
    .catch((err) => {throw err});        
}

exports.getClient = function(){return client}