const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const cards = require("./cards.json");
const {userJoin, getCurrentUser, getARoom, removeUser, newAdmin, order_shuffle} = require("./utils/users")

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
        //cards[color].splice(random,1) 
    });

    socket.on("new_player",({username, roomcode, id}) =>{
        const user=userJoin(id, username, roomcode)
        socket.join(user.roomcode);
        io.to(user.roomcode).emit("room_update", getARoom(user.roomcode))
    });

    socket.on("increment", (roomcode) =>{
        var current = getARoom(roomcode)
        current["data"]["turn"]++
        switch (current["data"]["state"]){
            case "awaiting":
                order_shuffle(roomcode)
                current["data"]["turn"] = 0
                current["data"]["state"] = "white"
                io.to(roomcode).emit("game", current)
            case "white":
                if (current["data"]["turn"] === current["players"].length){
                    current["data"]["state"] = "presenting"
                    current["data"]["turn"] = 1
                    io.to(roomcode).emit("game", current)
                } 
                break;
            case "presenting": //might have to change this to default, or maybe an if else
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
                    current["data"]["turn"] = 1
                }
                io.to(roomcode).emit("game", current)
        }
    })
    socket.on("winner", (roomcode) =>{
        current = getARoom(roomcode)
        winner = current["players"].find(user => user.order === current["data"]["turn"])
        winner.score ++
        order_shuffle(roomcode)
        current["data"]["turn"] = 0
        current["data"]["state"] = "white"
        io.to(roomcode).emit("room_update", current)
        io.to(roomcode).emit("game", current)
        io.to(roomcode).emit("new_card", cards["perks"][randint(cards["perks"].length)], "white")
        io.to(roomcode).emit("new_card", cards["perks"][randint(cards["perks"].length)], "white")
        io.to(roomcode).emit("new_card", cards["flags"][randint(cards["flags"].length)], "red")
    })
    socket.on("present", (roomcode, card, type) =>{
        io.to(roomcode).emit("show", card, type)
    })

    socket.on("submitCards", (room, username, cards) =>{
        user = getARoom(room)["players"].find(user => user.username === username);
        user.played.push(cards)
    })

    socket.on("disconnect", ()=>{
        var quitter = getCurrentUser(socket.id)
        removeUser(quitter.id)
        if (quitter.admin===true){
            newAdmin(quitter.roomcode)
        }
        io.to(quitter.roomcode).emit("room_update", getARoom(quitter.roomcode))
    });
});
//order_shuffle(roomcode)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`)); //