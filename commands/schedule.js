const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu, MessageCollector } = require('discord.js');
const db = require("../db");
//let collectors = [];

class Schedule {
    constructor(active,time,changed=false){
        this.active = active;
        this.time = time;
        this.changed = changed;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cooking_schedule')
		.setDescription('Schedule Burger')
        .addUserOption(option => option.setName('time').setDescription('When to cook burger (UTC)')),
	async execute(interaction) {

        if(!has_permission(interaction.member,interaction.channel)){
            reply(interaction, {content: "You must be a moderator to set burger schedule.", ephemeral: true})
            return;
        }

        let schedule;
        let disable_interaction = false;

        //disable active collector in channel or prevent new collector
        /*
        for (let i = collectors.length; i > 0; i--){
            if(collectors[i-1].channelId == interaction.channelId){
                stop_collector(collectors[i-1]);
            }
        }
        */
        //let collector;

        fetch_schedule(interaction)
            .then(s =>{
                schedule = s;
                //let message = get_message(interaction, schedule);
                console.log(s);
                return get_message(schedule);
                //return reply(interaction, message);
            })
            .then(msg =>{
                reply(interaction,msg)
                .then((reply) =>{
                    const collector = reply.createMessageComponentCollector({ componentType: 'BUTTON', time: 30*1000, errors: ['time'] });
                    const menu_collector = reply.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 30*1000, errors: ['time'] });
                    collector.on('collect', i => {
                        if (i.user.id === interaction.user.id) {
                            let update = false;
                            
                            //i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
                            switch(true)
                            {
                                case i.customId === 'enable':
                                    schedule.active = !schedule.active;
                                    schedule.changed = true;
                                    update = true;
                                    break;
                                case i.customId === 'save':
                                    
                                    disable_interaction = true;
                                    save(interaction,schedule)
                                        .then(status => {
                                            i.update({content: `${status}`,components: []});
                                        })
                                    return
                                    break;
                                case i.customId === 'cancel':
                                    disable_interaction = true;
                                    i.update({content: `Canceled`,components: []});
                                    return;
                                    break;
                            }
                            console.log(interaction.channel);
                            if(update) {
                            get_message(schedule, disable_interaction)
                                   .then(m=>{
                                       i.update(m);
                                   })
                            }
                        } else {
                            i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                        }
                    });

                    menu_collector.on('collect',i =>{
                        if (i.user.id === interaction.user.id) {
                            schedule.time = i.values[0];
                            schedule.changed = true;
                            get_message(schedule, disable_interaction)
                                   .then(m=>{
                                       i.update(m);
                                   })
                        }
                    })
            
                    collector.on('end', collected => {
                        if(!disable_interaction)interaction.editReply({content: `Command Expired`,components: []});
                        //remove_collector(collector);
                        //console.log('end called')
                    });
                })
            })
	},
};
/*
function remove_collector(collector) {
    let index = collectors.indexOf(collector);
    if (index > -1) {
        collectors.splice(index, 1);
    }
}

function stop_collector(collector) {
    remove_collector(collector);
    collector.stop();
}
*/

function has_permission(member,channel){
    return(member.permissionsIn(channel).has('KICK_MEMBERS') || member.permissionsIn(channel).has('ADMINISTRATOR'));
}

async function get_message(schedule, disable_interaction = false) {
    let message = {};
    
    const rows = [
        new MessageActionRow()
        .addComponents(get_enabled_button(schedule.active)),
        new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('set_time')
                .setPlaceholder(schedule.time.substring(0,5) +' UTC')
                .addOptions(get_times())
                .setDisabled(disable_interaction),
        ),
        new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('PRIMARY')
                .setDisabled(disable_interaction)
        )
        .addComponents(
            new MessageButton()
                .setCustomId('save')
                .setLabel('Save')
                .setStyle('PRIMARY')
                .setDisabled(!schedule.changed || disable_interaction),
        )]
    console.log(rows)
    message = { content: 'Set time', components: [rows[1],rows[0],rows[2]], ephemeral: true, fetchReply: true };

    return message;
}

function reply(interaction, message){
    return new Promise(function(resolve){
        resolve(interaction.reply(message));
    })
}

function get_enabled_button(enabled,disable_interaction){
    let label = 'ENABLE  🍔🕑';
    let style = 'SUCCESS';
    if(enabled){
        label = 'DISABLE 🍔🕑';
        style = 'DANGER'
    }
    return new MessageButton()
        .setCustomId('enable')//same id as enable_button
        .setLabel(label)
        .setStyle(style)
}

function get_times(){
    var times = [];
    for(var t=0; t<24; t++){
        times[t] = {
            label:`${t}:00 UTC`,
            //description:`${t}:00 UTC`,
            value: `${t}:00:00`,
            }
    }
    return times;
}

function fetch_schedule(interaction){
    return new Promise(function(resolve){
        let channel = interaction.channelId;
        let sql = `select * from schedule where channel_id = '${channel}'`;
        let schedule;
        db.executeQuery(sql)
            .then(rows => {
                schedule = fill_schedule(null, rows);
                resolve(schedule);
            });
    });
}

function save(interaction, schedule){
    return new Promise(function(resolve){
        let channel = interaction.channelId;
        let guild = interaction.guildId;
        let sql = `INSERT INTO schedule (guild_id, channel_id, scheduled_time, active)` + 
            ` values ('${guild}', '${channel}', '${schedule.time}', ${schedule.active ? 1: 0})` + 
            ` ON DUPLICATE KEY UPDATE scheduled_time=VALUES(scheduled_time), active=VALUES(active);`

        db.executeQuery(sql)
            .then(rows => {
                resolve("Saved")
            })
            .catch(err =>{
                console.error(err)
                resolve(`Save Unsuccessful [${err.code}]`)
            })
        console.log(sql)
    });
}

function fill_schedule(err, rows){
    if (err) throw err;
    let enabled = 0;
    let time = '00:00:00';
    let changed = false;
    console.log(rows);
    if(rows.length != 0){
        time = rows[0].scheduled_time;
        enabled = rows[0].active;
    }
    return new Schedule(enabled,time,changed);
}