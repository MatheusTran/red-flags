const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const cards = require("./cards.json");
const {userJoin, getARoom, newAdmin, order_shuffle} = require("./utils/users")
phase = {awaiting:"white", white:"presenting", presenting:"red", red:"pick", pick:"pick"}
//note to self, it might be bad if I just straight up remove people from rooms, I should fix the whole thing in case someone leaves

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
        //cards[color].splice(random,1) //this removes cards from the deck, but I might have to change this later since this would affect other rooms as well
        //I was thinking of every room having a deck, then removing cards from the room decks, but Idk if that is feasable 
    });

    socket.on("new_player",({username, roomcode, id}) =>{
        const user=userJoin(id, username, roomcode)
        socket.join(user.roomcode);
        current = getARoom(user.roomcode)
        socket.emit("game", current)
        socket["room"] = roomcode
        io.to(user.roomcode).emit("room_update", current)
    });

    socket.on("increment", (roomcode) =>{
        var current = getARoom(roomcode)
        current["data"]["turn"]++
        if (current["data"]["turn"] >= current["players"].length){
            if (current["data"]["state"] === "awaiting"){
                order_shuffle(roomcode)
            }
            current["data"]["turn"] = 1
            current["data"]["state"] = phase[current["data"]["state"]]
        }
        io.to(roomcode).emit("game", current)
    })

    socket.on("winner", (roomcode) =>{
        current = getARoom(roomcode)
        winner = current["players"][current["data"]["turn"]]
        if (winner){
            winner.score ++
        }
        order_shuffle(roomcode)
        current["data"]["turn"] = 1
        current["data"]["state"] = "white"
        if (current["waiting"]){
            for (x in current["waiting"]){
                current["players"].push(current["waiting"][x])
                current["waiting"].splice(x,1)
            }
        }
        io.to(roomcode).emit("room_update", current)
        io.to(roomcode).emit("game", current)
        //socket.broadcast.to(roomcode).emit("new_card", cards["white"][randint(cards["white"].length)], "white")
    });

    socket.on("present", (roomcode, card, type) =>{
        io.to(roomcode).emit("show", card, type)
    });

    socket.on("submitCards", (room, username, cards) =>{
        user = getARoom(room)["players"].find(user => user.username === username);
        user.played.push(cards)
    });

    socket.on("disconnect", ()=>{
        current = getARoom(socket["room"])
        var quitter = current["players"].find(user => user.id === socket.id)
        current["players"].splice(current["players"].indexOf(quitter),1)
        if((current["data"]["state"]==="white" && quitter["played"].length > 0)){
            current["data"]["turn"]--//I have to change this later, in case they are in the waiting room instead of the actual room
        }
        if (quitter.admin){
            newAdmin(socket["room"]) 
        }
        if (current["players"].length <3){
            current["data"]["turn"] = 0
            current["data"]["state"] = "awaiting"
            io.to(socket["room"]).emit("game", current)
        }
        if (quitter.swiper && !(current["players"].length <3)){ //I could write >=3 but I just wanted to write <3
            order_shuffle(socket["room"])
            current["data"]["turn"] = 0//I can change this if I remove the incremement from swiper in flags.js, and factor this out
            current["data"]["state"] = "white"
            io.to(socket["room"]).emit("game", current)
        } //maybe I could move this above the previous if statement, or change it to an if else statement
        io.to(socket["room"]).emit("room_update", current)
    });
}); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`\n\x1b[32m[server]\x1b[0m running on port: \x1b[33m${PORT}\x1b[0m \n`));