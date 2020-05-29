var http = require('http');
var cp = require('child_process');
var querystring = require('querystring');

var pre_url = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=b9fcc83f7c692ebc10b2b0ec69841605&artist=";
var dat = []; //artist, song, image
var dat_obj = {};
var datJson = "";
var back_song = "", back_artist = "", back_album = "", back_next = "", back_img = "";

function get_meta() {
    var mpc = cp.spawnSync('curl', ['localhost:8888/status-json.xsl']);
    var mpc_data = mpc.stdout.toString();
    var mpc_obj = JSON.parse(mpc_data);
    var title_string = mpc_obj.icestats.source.title;
    var title_arr = title_string.split("-");
    var artist = title_arr[title_arr.length - 2].trim();
    artist = artist.replace(/[{()}]/g, '');
    var track = title_arr[title_arr.length - 1].trim();
    track = track.replace(/[{()}]/g, '');
    // console.log(track);
    var real_url = pre_url + artist + "&track=" + track + "&format=json" ;
    var rreal_url = encodeURI(real_url);
    dat[0] = artist;
    dat[1] = track;
    mpc = cp.spawnSync('curl', [rreal_url]);
    mpc_data = mpc.stdout.toString();
    // console.log(mpc_data);
    mpc_obj = JSON.parse(mpc_data);
    if(mpc_obj.track != undefined && mpc_obj.track.album != undefined && mpc_obj.track.album.title) {
        var album = mpc_obj.track.album.title;
    } else {
        var album = artist;
    }
    if(mpc_obj.track != undefined && mpc_obj.track.album != undefined && mpc_obj.track.album.image != undefined) {
        var image_url = mpc_obj.track.album.image[3]['#text'];
    } else {
        image_url = "black_fucker";
    }
    dat[2] = album;
    dat[3] = image_url;
    console.log(artist);
    console.log(track);
    console.log(album);
    console.log(image_url);

    dat_obj.artist = dat[0];
    dat_obj.track = dat[1];
    dat_obj.album = dat[2];
    dat_obj.image_url = image_url;

    datJson = JSON.stringify(dat_obj);
    console.log(datJson);
}

var count = 0;
var server = http.createServer(function (req, res) {   //create web server
    if (req.url == '/getmeta') { //check the URL of the current request
        console.log("Someone requested meta! " + ++count);
        get_meta();
        // set response header
        res.writeHead(200, "OK", { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type', 
        'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
        }); 
        
        // set response content    
        res.write(datJson);
        res.end();
    
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