var http = require('http');
var cp = require('child_process');
var querystring = require('querystring');
// var express = require('express');


var pre_url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=b9fcc83f7c692ebc10b2b0ec69841605&artist=";
var dat = []; //song, album, artist, next
var datJson = "";
var back_song = "", back_artist = "", back_album = "", back_next = "", back_img = "";

function get_meta() {
    var mpc = cp.spawnSync('mpc', ['current']);
    var mpc_data = mpc.stdout.toString();
    mpc_data = mpc_data.trim()
    if(mpc_data == "alsa://default") {
        dat[0] = ("Mic Audio");
        mpc = cp.spawnSync('mpc', ['queue']);
        mpc_data = mpc.stdout.toString().trimRight();
        dat[1] = undefined;
        dat[2] = undefined;
        dat[3] = mpc_data;
        dat[4] = undefined;
        datJson = JSON.stringify(dat);
        return;
    }
    var mpc_data_f = mpc_data.split(' - ');
    dat[0] = (mpc_data_f[1]);
    var artist_temp = mpc_data_f[0];
    mpc = cp.spawnSync('mpc', ['status', '-f', '%album%']);
    mpc_data = mpc.stdout.toString();
    mpc_data = mpc_data.trim()
    mpc_data_f = mpc_data.split('\n');
    dat[1] = (mpc_data_f[0]);
    dat[2] = (artist_temp);
    mpc = cp.spawnSync('mpc', ['queue']);
    mpc_data = mpc.stdout.toString().trimRight();
    dat[3] = mpc_data;
    

    //if album and artist are same skip other things
    if(back_album == dat[1] && back_artist == dat[2]){
        mpc = cp.spawnSync('mpc', ['queue']);
        mpc_data = mpc.stdout.toString().trimRight();
        dat[3] = mpc_data;
        datJson = JSON.stringify(dat);
        return;
    }

    // we have the dat without image now, song, album, artist
    var real_url = pre_url + dat[2] + "&album=" + dat[1] + "&format=json";
    var rreal_url = encodeURI(real_url);
    mpc = cp.spawnSync('curl', [rreal_url]);

    var res_obj = JSON.parse(mpc.stdout);
    if()
    dat[4] = (res_obj.album.image[5]['#text'].toString() ? res_obj.album.image[5]['#text'].toString() : undefined);

    datJson = JSON.stringify(dat);

    back_song = dat[0];
    back_album = dat[1];
    back_artist = dat[2];
    back_next = dat[3];
    back_img = dat[4];
}

//dat is the array with song,album, artist, cover art and datJson is the JSON for the same.

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