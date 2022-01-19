const { compute_rest_props } = require("svelte/internal"); //I do not remember adding this? no clue what this does
const rooms = {};
//join user to chat
function userJoin(id, username, roomcode){
    const user = {id, username, roomcode, score:0, admin:false, played:[]};//if I use index method then swiper is also obsolete
    if (!rooms[roomcode]){
        rooms[roomcode] = {players:[],data:{state:"awaiting",turn:1},waiting:[]}
        user.admin = true
    }
    if(rooms[roomcode]["data"]["state"] === "white" || rooms[roomcode]["data"]["state"] === "awaiting"){
        rooms[roomcode]["players"].push(user)
        rooms[roomcode]["data"]["turn"]++
    } else {
        rooms[roomcode]["waiting"].push(user)
    }
    //console.table(rooms[roomcode]["players"])
    return user;
};

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
      // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function order_shuffle(roomcode){
    //var temp = [...Array(rooms[roomcode]["players"].length).keys()]
    var next = rooms[roomcode]["players"][1]//I just realized this doesn't actually work... will have to find a new method later
    rooms[roomcode]["players"].splice(1,1) //however it at least prevents the same person being the swiper twice
    shuffle(rooms[roomcode]["players"])
    rooms[roomcode]["players"].splice(0,0,next)
    for (x in rooms[roomcode]["players"]){//this does not do the same thing as python, keep that in mind
        rooms[roomcode]["players"][x].played = [] 
    }
}

function getARoom(room){
    return rooms[room]
};

function newAdmin(room){
    if (!rooms[room]["players"][0]){
        delete rooms[room]
    } else {
        rooms[room]["players"][0]["admin"] = true
    }

}

module.exports = {
    userJoin,
    getARoom,
    newAdmin,
    order_shuffle
};