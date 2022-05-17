const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const db = require("../db");

class Schedule {
    constructor(enabled,time){
        this.enabled = enabled;
        this.time = time;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cooking_schedule')
		.setDescription('Schedule Burger')
        .addUserOption(option => option.setName('time').setDescription('When to cook burger (UTC)')),
	async execute(interaction) {
        const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 15*1000 });

        collector.on('collect', i => {
            if (i.user.id === interaction.user.id) {
                
                i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
        fetch_schedule(interaction);
        
	},
};

async function get_message(interaction,schedule){
    if (interaction.member.permissionsIn(interaction.channel).has('KICK_MEMBERS') || interaction.member.permissionsIn(interaction.channel).has('ADMINISTRATOR')){
        const rows = [
            new MessageActionRow()
            .addComponents(get_button(schedule.enabled)),
            new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('set_time')
                    .setPlaceholder(schedule.time +' UTC')
                    .addOptions(get_times()),
            )]
                
        await interaction.reply({ content: 'Set time', components: [rows[0],rows[1]], ephemeral: true });
    }
    else{
        await interaction.reply({ content: "You must be a moderator to set burger schedule", ephemeral: true });
    }
    
}

function get_button(enabled){
    if(enabled)return get_disable_button();
    return get_enable_button();
}

function get_enable_button(){
    return new MessageButton()
        .setCustomId('enable')
        .setLabel('ENABLE 🍔🕑')
        .setStyle('SUCCESS')
}

function get_disable_button(){
    return new MessageButton()
        .setCustomId('disable')
        .setLabel('DISABLE 🍔🕑')
        .setStyle('DANGER')
}


function get_times(){
    var times = [];
    for(var t=0; t<24; t++){
        times[t] = {
            label:`${t}:00 UTC`,
            //description:`${t}:00 UTC`,
            value: `${t}`,
            }
    }
    return times;
}

function fetch_schedule(interaction){
    let channel = interaction.channelId;
    let sql = `select * from schedule where channel_id = '${channel}'`;
    console.log(sql);
    let schedule;
    db.executeQuery(sql)
        .then(rows => {
            schedule = fill_schedule(null, rows);
            get_message(interaction,schedule)
        })
}

function fill_schedule(err, rows){
    if (err) throw err;
    let enabled = 0;
    let time = '00:00:00';
    
    console.log(rows);
    if(rows.length != 0){
        time = rows[0].scheduled_time;
        enabled = rows[0].active;
    }
    return new Schedule(enabled,time)
}