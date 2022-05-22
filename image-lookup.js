const { MessageEmbed } = require('discord.js');

const gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
let gelImages = 'https://img3.gelbooru.com/images/';
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
const safeSearchTag = 'rating%3asafe+sort%3arandom';
const gelPost = 'https://gelbooru.com/index.php?page=post&s=view&id=';
const gelTag = 'https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&names='


function get_image_metadata(tag = 'burger'){
    return new Promise((resolve, reject) =>{
        let tags = `tags=${tag}+${safeSearchTag}`;
        let url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&${tags}&limit=1&pid=1${gelAuth}`;
        fetch(url)
            .then(res =>{
                res.json()
                .then(json =>{
                    resolve(json);
                });
            })
            .catch(err =>{
                console.log(err);
                reject(err);
            })
    })
}



exports.get_embedded_image_msg = function(tag = 'burger'){
    return new Promise(function(resolve,reject){
    get_image_metadata(tag)
        .then((json) => {
            resolve( {embeds : [build_embed(json)]});
        })
        .catch(err => reject(err))
    })
}

function build_embed(json){
    //404 link example: 'https://img3.gelbooru.com/images/a0/aa/a4c450f47d2d4be4d77f6746bb12cc1c981ae937.png'
    const url = json.post[0].file_url;
    const source = json.post[0].source;
	const embed = new MessageEmbed()
	.setImage(url);
    if (source != ""){
        embed.setAuthor({name: source, url: source});
    }
	return embed;
}


function get_image_tags(tags) {
    return new Promise((resolve, reject) => {
        let url = `https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&names=${tags}${gelAuth}`
        fetch(url)
            .then(res => res.json())
            .then(json => resolve(json));
    })
}