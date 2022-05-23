const db = require("./db");
const scheduler = require('node-schedule');
const bot = require('./bot');
const lookup = require("./image-lookup");

const rule = new scheduler.RecurrenceRule();
rule.minute = 00;

scheduler.scheduleJob(rule,function(){
    let date = new Date()
    let hour = date.getUTCHours();
    //const sql = 'select * from schedule'
    const sql = `select * from schedule where scheduled_time = '${hour}:00:00' and active = 1`;
    db.executeQuery(sql)
        .then(rows => {
            if(rows.length>0){
                let orders = [];
                const client = bot.getClient();
                rows.forEach(row => {
                    client.channels.fetch(row.channel_id)
                        .then(channel => {
                            lookup.get_embedded_image_msg('burger')
			                    .then((msg) => channel.send(msg)
                                .then((res)=> db.add_serving(row.guild_id,row.channel_id)))
			                    .catch(err => {
                                    console.log(err);
                                    post_failed(row);
                                })
                        })
                        .catch(err => {
                            post_failed(row);
                        })
                })
                //console.log(orders)
            }
        })
        .catch(err => {
            console.log(err);
        })
})



function post_failed(row){
    let failed_posts = row.failed_posts + 1;
    //if a server is unable to be posted in 5 times remove it from the list
    let sql = ``;
    if(failed_posts < 5){
        sql = `update schedule set failed_posts = ${failed_posts} where channel_id = '${row.channel_id}'`; 
    }
    else{
        sql = `delete from schedule where channel_id = '${row.channel_id}'`
    }
    db.executeQuery(sql)
        .catch(err => console.error(err));
}