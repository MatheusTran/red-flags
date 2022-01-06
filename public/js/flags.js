const socket = io();
cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});
const message = document.querySelector("#msg-box")
button = document.querySelector("#player-button")
played = document.getElementById("played-cards")
Left = document.querySelector(".left") 
Right = document.querySelector(".right")


socket.on("joined", ()=>{ //change this in the future to change the message on the top
    id = socket.id;
    socket.emit("new_player", {username, roomcode, id})
    for(let x=0; x<10; x++){
        socket.emit("pull", "perks")//I can change this in the future
    };
    for(let x=0; x<5; x++){
        socket.emit("pull", "flags")
    };
});

socket.on("new_card", (card, type) =>{
    hand = document.querySelector("#hand")
    cards.push(card)
    thing = document.createElement("div")
    thing.setAttribute("class", (type === "perks" ? "white" : "red") + " card") //if I change type to be white or red, I can just use type here, I need to change cards.json for that
    thing.textContent = card["text"];
    if (card["Custom"]){
        thing.appendChild(document.createElement("br"))
        custom = document.createElement("input")
        custom.classList.add("custom")
        custom.setAttribute("placeholder", "custom text")
        thing.appendChild(custom)
    }; //make this a function 
    thing.setAttribute("id", cards.length)
    thing.setAttribute("ondblclick", `select(${cards.length})`)
    hand.appendChild(thing)
});


socket.on("room_update", (data)=>{
    room = data
    score = document.querySelector(".players-menu select");
    score.innerHTML = "";
    var player = document.createElement("option");
    player.classList.add("player");
    for(x in room["players"]){
        player.textContent = room["players"][x]["username"] + ": " + room["players"][x]["score"]
        score.appendChild(player.cloneNode(true))
    };
    if (room["data"]["state"]==="awaiting" && room["players"].find(user => user.username === username)["admin"]){
        button.style.display = "inline-block"
    } 
});

socket.on("game", (upRoom)=>{
    room = upRoom
    switch(room["data"]["state"]){
        case "awaiting":
            message.innerText = "waiting for host to start the game"
            break;
        case "white":
            played.innerHTML=""
            Left.style.display = "none"
            Right.style.display = "none"
            if (room["players"].find(user => user.username === username)["swiper"]){
                message.innerText = "You are lonely and looking for someone to fill the empty void that is your heart. Don't worry, you'll find someone eventually"
                socket.emit("increment", roomcode)
                break;
            }
            message.innerText = `${room["players"].find(user => user.swiper)["username"]} is looking for love, play two white cards`
            button.innerText = "confirm"
            break;
        case "waiting":
            message.innerText = "waiting for others"
            break;
        case "presenting":
            presenter = room["players"].find(user => user.order ===room["data"]["turn"])["username"] //wait a second this is basically the same as var "you", I can change this later
            played.innerHTML = ""
            if (presenter === username){
                you = room["players"].find(user => user.username === username)
                message.innerText = "you are presenting your candidate, press next to reveal your cards"
                button.innerText = "next"
                button.style.display = "inline-block"
                break;
            }
            message.innerText = `${presenter} is presenting their candidate`
            break;
        case "red":
            flagger = room["players"].find(user => user.order ===room["data"]["turn"])
            //might change this to an if else statement 
            flagged = flagger["order"] === 1 ? room["players"].find(user => user.order === room["players"].length-1) : room["players"].find(user => user.order === flagger["order"]-1)
            played.innerHTML = ""
            if (flagger["username"] === username){
                you = room["players"].find(user => user.username === username)
                message.innerText = `you are ruining ${flagged["username"]}'s candidate, play a red card`
                button.innerText = "confirm" 
                socket.emit("present", roomcode, flagged["played"][0], "white")
                socket.emit("present", roomcode, flagged["played"][1], "white")
                break;
            }
            message.innerText = `${flagger["username"]} is presenting ${flagged["username"]}'s flaw`
            break;
        case "pick":
            played.innerHTML = ""
            candidate = room["players"].find(user => user.order ===room["data"]["turn"])
            swiper = room["players"].find(user => user.swiper)
            if (swiper["username"] === username){
                message.innerText = "swipe left to see the next candidate, swipe right to choose your lover"
                Left.style.display = "flex"
                Right.style.display = "flex"
                socket.emit("present", roomcode, candidate["played"][0], "white")
                socket.emit("present", roomcode, candidate["played"][1], "white")
                socket.emit("present", roomcode, candidate["played"][2], "red")
                break;
            }
            message.innerText = `${swiper["username"]} is searching for they're one true lover` //grammar wrong on purpoise
            break;
        }
})

socket.on("show", (card, type)=>{
    thing = document.createElement("div")
    thing.setAttribute("class", type + " card") //change this
    thing.textContent = card;
    played.appendChild(thing)
})

function select(id){//this is to select the cards
    if (!room["players"].find(user => user.username === username)["swiper"]){
        var selected = document.getElementById(id)
        switch (room["data"]["state"]){
            case "white": 
                if (selected.parentElement.id === "hand" && played.children.length < 2 && selected.classList.value === "white card"){ //switch this around later, add an elif
                    destination = document.getElementById("played-cards")
                } else {
                    destination = document.getElementById("hand")
                }
                selected.parentElement.removeChild(selected)
                destination.appendChild(selected)
                button.style.display = played.children.length === 2 ? "inline-block" : "none"
                break;
    
            case "red":
                if (flagger["username"]===username){
                    if (selected.parentElement.id === "hand" && played.children.length <3 && selected.classList.value === "red card"){
                        destination = document.getElementById("played-cards")
                    } else {
                        destination = document.getElementById("hand") 
                    }
                    console.log(played.children.length)
                    selected.parentElement.removeChild(selected)
                    destination.appendChild(selected)
                    button.style.display = played.children.length === 3 ? "inline-block" : "none"
                    break;
                }

        }
    };
}

function create_custom(id){
    var custom = document.getElementById(id)
    text = document.querySelector(`[id='${id}'] .custom`).value
    if (custom.innerText === "(Custom card)\n"){
        custom.innerText = text
    } else {
        custom.innerText = custom.innerText.replace("_____", text)
    }
}

function action(){
    switch (room["data"]["state"]){
        case "awaiting":
            if (room["players"].length > 2){
                socket.emit("increment", roomcode)
                button.style.display = "none"
            } else {
                alert("need at least 3 players to begin")
            }
            break;
        case "white":
            for (let x=0; x < played.children.length;x++){
                if(cards[parseInt(played.children[x].id)-1]["Custom"]){
                    create_custom(played.children[x].id)
                }
                socket.emit("submitCards",roomcode, username, played.children[x].innerText)
            }
            socket.emit("increment", roomcode)
            button.style.display = "none"
            break;
        case "presenting":
            if (you["played"].length > 0){
                socket.emit("present", roomcode, you["played"][0], "white")
                you["played"].splice(0,1)
                break;
            }
            socket.emit("increment", roomcode)
            button.style.display = "none"
            break;
        case "red":
            if(button.innerText === "confirm"){
                if(cards[parseInt(played.children[2].id)-1]["Custom"]){
                    create_custom(played.children[2].id)
                }
                socket.emit("submitCards",roomcode, flagged["username"], played.children[2].innerText)                
                socket.emit("present", roomcode, played.children[2].innerText, "red")
                played.removeChild(played.children[2])
                button.innerText = "next"
                break;
            }
            socket.emit("increment", roomcode)
            button.style.display = "none"
            break;
    }
}

function swipeRight(){

}