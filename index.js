const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const cards = require("./cards.json");
const {userJoin, getCurrentUser, getARoom, removeUser, newAdmin, order_shuffle} = require("./utils/users")
phase = ["white", "presenting", "red", "pick"] //maybe try using elements?
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
        //cards[color].splice(random,1) //this removes cards from the deck, but I might have to change this later
        //I was thinking of every room having a deck, then removing cards from the room decks, but Idk if that is feasable 
    });

    socket.on("new_player",({username, roomcode, id}) =>{
        const user=userJoin(id, username, roomcode)
        socket.join(user.roomcode);
        current = getARoom(user.roomcode)
        socket.emit("game", current)
        io.to(user.roomcode).emit("room_update", current)
    });

    socket.on("increment", (roomcode) =>{
        var current = getARoom(roomcode)
        current["data"]["turn"]++
        switch (current["data"]["state"]){ //all of these contain the if current["data"]["turn"] === current["players"].length, I could refactor this outside, as for awaiting, I can change the starting turn to be players.length
            case "awaiting":
                order_shuffle(roomcode)
                current["data"]["turn"] = 0//I can change this if I remove the incremement from swiper in flags.js, and factor this out
                current["data"]["state"] = "white"//I might be able to change this, with the whole list idea
                io.to(roomcode).emit("game", current)
            case "white":
                if (current["data"]["turn"] === current["players"].length){
                    current["data"]["state"] = "presenting"
                    current["data"]["turn"] = 1
                    io.to(roomcode).emit("game", current)//the problem is this emit, if it weren't for this emit I could factor the other emits out as well
                } //I can maybe change this to an if else statement
                break;
            case "presenting":
                if (current["data"]["turn"] >= current["players"].length){
                    current["data"]["state"] = "red"
                    current["data"]["turn"] = 1
                }
                io.to(roomcode).emit("game", current)
                break;
            case "red":
                if (current["data"]["turn"] >= current["players"].length){
                    current["data"]["turn"] = 1
                    current["data"]["state"] = "pick"
                }
                io.to(roomcode).emit("game", current)
                break;
            case "pick":
                if (current["data"]["turn"] >= current["players"].length){
                    current["data"]["turn"] = 1//keep this part in mind when using the phase array method, the array should NOT loop around once it reached the end
                }
                io.to(roomcode).emit("game", current)
        }
    })
    socket.on("winner", (roomcode) =>{
        current = getARoom(roomcode)
        winner = current["players"].find(user => user.order === current["data"]["turn"])
        if (winner){
            winner.score ++
        }
        order_shuffle(roomcode)
        current["data"]["turn"] = 0
        current["data"]["state"] = "white"
        if (current["waiting"]){
            for (x in current["waiting"]){
                current["players"].push(current["waiting"][x])
                current["waiting"].splice(x,1)
            }
        }
        io.to(roomcode).emit("room_update", current)
        io.to(roomcode).emit("game", current)
        socket.broadcast.to(roomcode).emit("new_card", cards["white"][randint(cards["white"].length)], "white")
        socket.broadcast.to(roomcode).emit("new_card", cards["white"][randint(cards["white"].length)], "white")
        socket.broadcast.to(roomcode).emit("new_card", cards["red"][randint(cards["red"].length)], "red")
    });

    socket.on("present", (roomcode, card, type) =>{
        io.to(roomcode).emit("show", card, type)
    });

    socket.on("submitCards", (room, username, cards) =>{
        user = getARoom(room)["players"].find(user => user.username === username);
        user.played.push(cards)
    });

    socket.on("disconnect", ()=>{
        var quitter = getCurrentUser(socket.id)
        current = getARoom(quitter.roomcode)
        removeUser(quitter.id)
        if (quitter.admin){
            newAdmin(quitter.roomcode)
        }
        if (current["players"].length <3){
            current["data"]["turn"] = 0
            current["data"]["state"] = "awaiting"
            io.to(quitter.roomcode).emit("game", current)
        }
        if (quitter.swiper && !(current["players"].length <3)){ //I could write >3 but I just wanted to write <3
            order_shuffle(quitter.roomcode)
            current["data"]["turn"] = 0//I can change this if I remove the incremement from swiper in flags.js, and factor this out
            current["data"]["state"] = "white"
            io.to(quitter.roomcode).emit("game", current)
        } //maybe I could move this above the previous if statement, or change it to an if else statement

        io.to(quitter.roomcode).emit("room_update", current)
    });
}); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`\n\x1b[32m[server]\x1b[0m running on port: \x1b[33m${PORT}\x1b[0m \n`)); //