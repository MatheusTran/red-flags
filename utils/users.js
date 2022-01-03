const users = [];
const rooms = {};
const phases = ["white", "presenting", "red", "pick"]
//join user to chat
function userJoin(id, username, roomcode){
    const user = {id, username, roomcode, score:0, admin:false, order:0, swiper:false, played:[]};
    if (!rooms[roomcode]){
        rooms[roomcode] = {players:[],data:{state:"awaiting",turn:0}}
        user.admin = true
    }
    users.push(user);
    rooms[roomcode]["players"].push(user)
    user.order = rooms[roomcode]["players"].length -1
    console.table(rooms[roomcode]["players"])
    return user;
};

//get current user
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
    console.log(rooms[roomcode])
    temp = [...Array(rooms[roomcode]["players"].length).keys()]//this creates a list of numbers up to n, sort of like [x for x in range(n)] in python
    shuffle(temp)
    for (x in rooms[roomcode]["players"]){//this does not do the same thing as python, keep that in mind
        rooms[roomcode]["players"][x].swiper = temp[x]===0 //I just realized this is a typo, should be swipper not swiper. it's a bit too late to change it now
        rooms[roomcode]["players"][x].order = temp[x]
    }
    console.log(temp)
    console.table(rooms[roomcode]["players"])
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