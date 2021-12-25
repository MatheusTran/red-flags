const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const cards = require("./cards.json");
const {userJoin, getCurrentUser, getARoom, removeUser, newAdmin} = require("./utils/users")


const app = express();
const server = http.createServer(app);
const io = socketio(server);

function randint(n){
    return Math.floor(Math.random() * (n));
};

//set static folder
app.use(express.static(path.join(__dirname, "public")));

app.get("", function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});

//run when a client connects
io.on("connection", socket =>{
    socket.emit("joined");
    //listen for client
    socket.on("pull", (color) =>{
        var random = randint(cards[color].length)
        socket.emit("new_card", cards[color][random], color)
        //cards[color].splice(random,1) 
    });
    socket.on("new_player",({username, roomcode, id, score}) =>{
        const user=userJoin(id, username, roomcode)
        socket.join(user.roomcode);
        io.to(user.roomcode).emit("add_player", getARoom(user.roomcode))
    });
    socket.on("disconnect", ()=>{
        var quitter = getCurrentUser(socket.id)
        removeUser(quitter.id)
        if (quitter.admin===true){
            newAdmin(quitter.roomcode)
        }
        io.to(quitter.roomcode).emit("add_player", getARoom(quitter.roomcode))
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`)); //