
let gelAuth = `&api_key=${process.env.GEL_API}&user_id=${process.env.GEL_USER}`;
let gelImages = 'https://img3.gelbooru.com/images/';
//let tags = 'tags=burger+rating%3asafe+sort%3arandom';
const safeSearchTag = 'rating%3asafe+sort%3arandom';



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
    return(json.post[0].file_url);
}

module.exports = {getImage};