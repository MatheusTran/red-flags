const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const cards = require("./cards.json");
const players = {};


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
    //console.log("new connection")
    //broadcasts to the single user
    socket.emit("joined");
    //socket.broadcast.emit() broadcasts to everyone but the user
    socket.on("disconnect", ()=>{
        //console.log(socket.id)
        //roomcode = thing //fix thisssss. ACTUALLY CREATE ROOMS instead of your shitty json files
        //io.emit("add_player", players[roomcode])
        //console.log("there was a discconect")
    });
    //listen for client
    socket.on("pull", (color) =>{
        var random = randint(cards[color].length)
        socket.emit("new_card", cards[color][random], color)
        cards[color].splice(random,1)
    });
    socket.on("new_player",(username, roomcode, id) =>{
        if (!players[roomcode]){
            //console.log("new room")
            players[roomcode] = {}
        }
        players[roomcode][id] = {"name": username, "score":0, "swiper":false} //note to self, learn JQUERY you dumbass    
        io.emit("add_player", players[roomcode])
    });
});

const PORT = process.env.PORT || 3000;
console.log(PORT);
server.listen(PORT); //, () => console.log(`server running on port ${PORT}`)