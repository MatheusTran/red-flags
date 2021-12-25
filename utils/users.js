const users = [];
const rooms = {};

//join user to chat
function userJoin(id, username, roomcode){
    const user = {id, username, roomcode, score:0, admin:false, order:0, swiper:false};
    users.push(user);
    if (!rooms[roomcode]){
        rooms[roomcode] = []
        user.admin = true
    }
    rooms[roomcode].push(user)
    //console.table(rooms[roomcode])
    return user;
};

//get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
};

function getARoom(room){
    return rooms[room]
};

function removeUser(id){
    quitter = getCurrentUser(id)
    users.splice(users.indexOf(quitter),1)
    rooms[quitter.roomcode].splice(rooms[quitter.roomcode].indexOf(quitter),1)
}

function newAdmin(room){
    if (!rooms[room][0]){
        delete rooms[room]
    } else {
        newAd = rooms[room][0]
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
    newAdmin
};