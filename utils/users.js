const users = [];

//join user to chat
function userJoin(id, username, roomcode){
    const user = {id, username, roomcode, score:0};
    users.push(user);
    return user;
};

//get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
};

function getARoom(room){
    const everyone = []
    for (let x =0; x<users.length; x++){
        if (users[x].roomcode === room){
            everyone.push(users[x])
        }
    }
    return everyone
};

function removeUser(id){
    users.splice(users.indexOf(getCurrentUser(id),1))
}

module.exports = {
    userJoin,
    getCurrentUser,
    getARoom,
    removeUser
};