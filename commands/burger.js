const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require("../db");
const lookup = require("../image-lookup");

let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
let gelImages = 'https://img3.gelbooru.com/images/';
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
let safeSearchTag = 'rating%3asafe+sort%3arandom';



module.exports = {
	data: new SlashCommandBuilder()
		.setName('burger')
		.setDescription('Serves Burger'),

	async execute(interaction) {
		//let post = await lookup.getImage('burger');
		lookup.get_embedded_image_msg('burger')
			.then((msg) => interaction.reply(msg)
			.then(res => db.add_serving(interaction.guildId,interaction.channelId)))
			.catch(err => console.log(err))
		//interaction.channel.send(post);
        
	},
	
};

