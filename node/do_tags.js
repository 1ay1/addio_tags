var http = require('http');
var cp = require('child_process');
var querystring = require('querystring');

var track_pre_url = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=b9fcc83f7c692ebc10b2b0ec69841605&artist=";
var artist_pre_url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=";
var artist_su_url = "&api_key=b9fcc83f7c692ebc10b2b0ec69841605&format=json";
var album_pre_url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=b9fcc83f7c692ebc10b2b0ec69841605&artist="
var dat = {}; //artist, song, image
// var dat_obj = {};
var datJson = "";
var back_song = "", back_artist = "", back_album = "", back_next = "", back_img = "";

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime =  date+' '+time;

function get_meta() {
    today = new Date();
    date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    dateTime = date+' '+time;

    var mpc = cp.spawnSync('curl', ['localhost:8888/status-json.xsl']);
    var mpc_data = mpc.stdout.toString();
	if(mpc_data.indexOf("title") < 0){
		console.log("++++++++++++++++++| " + dateTime + " |++++++++++++++++++++++++++++++++");
		console.log("===================================================");
		console.log("MAKE THE STREAM LIVE FIRST!!!");
		console.log("===================================================");
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		return "s_n_u"; //stream_not_up
	}
    var mpc_obj = JSON.parse(mpc_data);
    if(mpc_obj.icestats.source[1] == undefined) {
        var title_string = mpc_obj.icestats.source.title;
    } else if (mpc_obj.icestats.source[0].title == undefined) {
        var title_string = mpc_obj.icestats.source[1].title;
    } else {
        var title_string = mpc_obj.icestats.source[0].title;
    }
    // var title_string = mpc_obj.icestats.source.title;
    var title_arr = title_string.split("-");
    var artist = title_arr[title_arr.length - 2].trim();
    //artist = artist.replace(/[{()}]/g, '');
    var track = title_arr[title_arr.length - 1].trim();
    //track = track.replace(/[{()}]/g, '');
    // console.log(track);
    var real_url = track_pre_url + artist + "&track=" + track + "&format=json" ;
    var rreal_url = encodeURI(real_url);
	rreal_url = rreal_url.replace("&#8217;", "%27");
    //console.log(rreal_url);
    if(dat["artist"] == artist && dat["track"] == track) {
        return;
    }
    dat["artist"] = artist;
    dat["track"] = track;
    mpc = cp.spawnSync('curl', [rreal_url]);
    mpc_data = mpc.stdout.toString();
    if(mpc_data.indexOf("<?") > 0) {
        console.log("++++++++++++++++++| " + dateTime + " |++++++++++++++++++++++++++++++++");
		console.log("===================================================");
		console.log("Last.fm gave shit response!!! Let's try again!");
		console.log("===================================================");
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        return ;        
    }
    // console.log(mpc_data);
	try {
        mpc_obj = JSON.parse(mpc_data);
	} catch (e) {
	        console.log("++++++++++++++++++| " + dateTime + " |++++++++++++++++++++++++++++++++");
                console.log("===================================================");
                console.log("Last.fm gave shit response for the track!!! Let's try again!");
                console.log("===================================================");
	        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		return ;
	}
    if(mpc_obj.track != undefined && mpc_obj.track.album != undefined && mpc_obj.track.album.title) {
        var album = mpc_obj.track.album.title;
    } else {
        var album = artist;
    }
    console.log(mpc_obj)

    //get the short track info
    var short_track_info = mpc_obj.track.wiki.summary;
    if(short_track_info == undefined) {
        dat["short_track"] = "no_short_track_info";
    } else {
        dat["short_track"] = short_track_info;
    }

    //get the cover art
    if(mpc_obj.track != undefined && mpc_obj.track.album != undefined && mpc_obj.track.album.image != undefined) {
        var image_url = mpc_obj.track.album.image[3]['#text'];
    } else {
        image_url = "black_fucker";
    }
    dat["album"] = album;
    dat["image"] = image_url;

    var real_url = artist_pre_url + artist + artist_su_url;
    var rreal_url = encodeURI(real_url);
    rreal_url = rreal_url.replace("&#8217;", "%27");
    mpc = cp.spawnSync('curl', [rreal_url]);
    mpc_data = mpc.stdout.toString();
    try {
        mpc_obj = JSON.parse(mpc_data);
	} catch (e) {
	        console.log("++++++++++++++++++| " + dateTime + " |++++++++++++++++++++++++++++++++");
                console.log("===================================================");
                console.log("Last.fm gave shit response for the artist!!! Let's try again!");
                console.log("===================================================");
	        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		return ;
    }
    
    //get the long artist info
    var artist_info = mpc_obj.artist.bio.content;
    if(artist_info == undefined) {
        dat["artist_info"] = "no_artist_info";
    } else {
        dat["artist_info"] = artist_info;
    }

	console.log("++++++++++++++++++| " + dateTime + " |++++++++++++++++++++++++++++++++");
    console.log("========================================================");
    console.log(artist);
    console.log(track);
    console.log(album);
    console.log(image_url);

    datJson = JSON.stringify(dat);
    console.log(datJson);
    console.log("========================================================");
	                console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

}

var count = 0;
var server = http.createServer(function (req, res) {   //create web server
    if (req.url == '/getmeta') { //check the URL of the current request
        console.log(dateTime + " ==== Someone requested meta! " + ++count);
        var get_meta_res = get_meta();
        // set response header
        res.writeHead(200, "OK", { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type', 
        'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
        }); 
        
        // set response content
	if( get_meta_res == "s_n_u") {
		res.write("Make the stream up first motherfucker!!!");
		res.end();
	} else {
        	res.write(datJson);
        	res.end();
	}
    
    }
    else
        res.end('Invalid Request!');

});

// var app = express();

// app.get('/getmeta', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.send("fuck you!");
//     res.end();
// });

// var server = app.listen(5000, function () {
//     console.log('Node server is running on 5000..');
// });

server.listen(5000); //6 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')
