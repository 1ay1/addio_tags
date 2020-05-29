var no_img = "./img/no_cover.png"

function get_text(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function () {
        if(request.status === 200) {
            callback(request.responseText);
        }
    };
    request.send(null);
}

function handle_shit(res_j) {
    var res_o = JSON.parse(JSON.parse(JSON.stringify(res_j)));
    track = res_o.track;
    artist = res_o.artist;
    album = res_o.album;
    image_url = res_o.image_url;

    if(image_url == "" || image_url == "black_fucker"){
        image_url = no_img;
    }

    var p_c_t = artist + " - " + track;

    var p_c = document.getElementById("p_cur");
    p_c.innerHTML = p_c_t;
    var p_a = document.getElementById("p_album");
    p_a.innerHTML = album;
    var p_img = document.getElementById("art_fucker");
    p_img.setAttribute("src", image_url);
}

var track = "";
var artist = "";
var album = "";
var image_url = "";

window.onload = function () {
    get_text("http://thepsychedelics.club:5000/getmeta", handle_shit);
    this.setInterval(() => {
        get_text("http://thepsychedelics.club:5000/getmeta", handle_shit);
    }, 10000);
}