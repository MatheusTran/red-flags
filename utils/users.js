const users = [];
const rooms = {};
//join user to chat
function userJoin(id, username, roomcode){
    const user = {id, username, roomcode, score:0, admin:false, order:0, swiper:false, played:[]};
    if (!rooms[roomcode]){
        rooms[roomcode] = {players:[],data:{state:"awaiting",turn:0},waiting:[]}
        user.admin = true
    }
    users.push(user);
    if(rooms[roomcode]["data"]["state"] === "white" || rooms[roomcode]["data"]["state"] === "awaiting"){
        rooms[roomcode]["players"].push(user)
        user.order = rooms[roomcode]["players"].length -1
    } else {
        rooms[roomcode]["waiting"].push(user)
    }
    //console.table(rooms[roomcode]["players"])
    return user;
};

function getCurrentUser(id){
    return users.find(user => user.id === id);
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
    var temp = [...Array(rooms[roomcode]["players"].length).keys()]//this creates a list of numbers up to n, sort of like [x for x in range(n)] in python
    var next = rooms[roomcode]["players"].indexOf(rooms[roomcode]["players"].find(user => user.swiper)) +1
    if (next >= rooms[roomcode]["players"].length){
        next = 0
    }
    shuffle(temp)
    temp[temp.indexOf(0)] = temp[next]
    temp[next] = 0 //I tried doing [temp[next], temp[temp.indexOf(0)]] = [temp[temp.indexOf(0)],temp[next]] but that kept glitching for no reason
    for (x in rooms[roomcode]["players"]){//this does not do the same thing as python, keep that in mind
        rooms[roomcode]["players"][x].swiper = temp[x]===0 
        rooms[roomcode]["players"][x].order = temp[x]
        rooms[roomcode]["players"][x].played = [] //might wanna check this out later
    }
}

function getARoom(room){
    return rooms[room]
};

function removeUser(id){
    quitter = getCurrentUser(id)
    users.splice(users.indexOf(quitter),1)
    rooms[quitter.roomcode]["players"].splice(rooms[quitter.roomcode]["players"].indexOf(quitter),1)
}

function newAdmin(room){
    if (!rooms[room]["players"][0]){
        delete rooms[room]
    } else {
        newAd = rooms[room]["players"][0]
        newAd.admin = true
        users[users.indexOf(newAd)].admin = true
        //console.table(rooms[room])
    }

}

module.exports = {
    userJoin,
    getCurrentUser,
    getARoom,
    removeUser,
    newAdmin,
    order_shuffle
};