const { MessageEmbed } = require('discord.js');
//used to decode html character references
const he = require('he');
const { format } = require('mysql');
const gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
const safeSearchTag = '-rating%3aexplicite+-rating%3aquestionable+sort%3arandom';
const gelPost = 'https://gelbooru.com/index.php?page=post&s=view&id=';
const ARTIST = 1;
const SERIES = 3;
const CHARACTER = 4;

function get_image_metadata(tag = 'burger',attempt = 0){
    return new Promise((resolve, reject) =>{
        let tags = `tags=${tag}+${safeSearchTag}`;
        let url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&${tags}&limit=1&pid=1${gelAuth}`;
        //console.log(url);
        fetch(url)
            .then(res =>{
                res.json()
                .then(json =>{
                    if(is_rating_safe(json.post[0].rating))resolve(json);
                    else if (attempt > 3) reject("Failed to find SFW tagged post")
                    else resolve(get_image_metadata(tag,++attempt));
                });
            })
            .catch(err =>{
                console.log(err);
                reject(err);
                return;
            })
    })
}

function is_rating_safe(rating){
    return (rating == "sensitive" || rating == "general" || rating == "safe");
}

function get_tag_metadata(tags) {
    return new Promise((resolve, reject) => {
        //decode tags from html
        let decoded_tags = he.decode(tags);
        //encode tags as UTF-8
        let encoded_tags = encodeURIComponent(decoded_tags)
        let url = `https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&names=${encoded_tags}${gelAuth}`
        fetch(url)
            .then(res => res.json())
            .then(json => resolve(json))
            .catch(err => reject(err));
    })
}


exports.get_embedded_image_msg = function(tag = 'burger'){
    return new Promise(function(resolve,reject){
    get_image_metadata(tag)
        .then((img_json) => get_tag_metadata(img_json.post[0].tags)
        .then((tag_json) => resolve( {embeds : [build_embed(img_json,tag_json)]})))
        .catch(err => reject(err))
    })
}

function build_embed(img_json,tag_json){
    //404 link example: 'https://img3.gelbooru.com/images/a0/aa/a4c450f47d2d4be4d77f6746bb12cc1c981ae937.png'
    const url = img_json.post[0].file_url;
    const source = img_json.post[0].source;
    let tags = get_tag_names(tag_json,1);
    let artist = tags.artist.string;
    if (tags.artist.number == 0) artist = source;

	const embed = new MessageEmbed()
	.setImage(url);
    if (artist != ''){
        embed.setAuthor({name: artist, url: source});
    }
    if (tags.series.number > 0) embed.addField('Series',tags.series.string,true);
    if (tags.character.number > 0) {
        let title = 'Character';
        if (tags.character.number > 1) title = 'Characters';
        embed.addField(title,tags.character.string,true);
    }
    
	return embed;
}

function get_tag_names(tag_json){
    let first = true;
    let tags = {
        artist : {
            string : '',
            number : 0
            },
        character : {
            string : '',
            number : 0
            },
        series : {
            string : '',
            number : 0
            },
    }
    tag_json.tag.forEach(tag =>{
        if(tag.type == ARTIST){
            tags.artist.string += (tags.artist.number == 0 ? 'Artist:' : ',') + ` ${format_tag(tag.name).replace(/_/g, ' ')}`;
            tags.artist.number += 1;
        }
        else if(tag.type == CHARACTER){
            tags.character.string += (tags.character.number == 0 ? '' : '\n') + ` ${escapeMarkdown(format_tag(tag.name))}`;
            tags.character.number += 1;
        }
        else if(tag.type == SERIES){
            tags.series.string += (tags.series.number == 0 ? '' : '\n') + ` ${escapeMarkdown(format_tag(tag.name))}`;
            tags.series.number += 1;
        }
    })
    
    return tags;
}

function format_tag(tag){
    return he.decode(tag)
    .replace(/_/g, ' ') //replace _ with spaces
    .replace(/(?:^|\s|\(|\/|-)\w/g, function(a) { return a.toUpperCase(); }) //capitalize every word
    .replace(/-(?:san|chan|tan|sensei|sama|kun|shi|dono|chama|se(?:m|n)pai)\b/gi, function(b) { return b.toLowerCase(); }); //make honorifics lowercase
}

function escapeMarkdown(text) {
    var unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
    var escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
    return escaped;
}

