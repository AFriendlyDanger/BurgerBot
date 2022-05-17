const { SlashCommandBuilder } = require('@discordjs/builders');

const lookup = require("../image-lookup");

let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
let gelImages = 'https://img3.gelbooru.com/images/';
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
let safeSearchTag = 'rating%3asafe+sort%3arandom';



module.exports = {
	data: new SlashCommandBuilder()
		.setName('burger')
		.setDescription('Serves Burger'),
        /*
        .addStringOption(option => 
            option.setName('restaurant')
            .setDescription('Where do you want to eat?')
			.setRequired(false)),
            */
	async execute(interaction) {
		let post = await lookup.getImage('burger');
		//interaction.channel.send(post);
        interaction.reply(post);
	},
};
