const socket = io();
cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});
const message = document.querySelector("#msg-box")
button = document.querySelector("#player-button")
played = document.getElementById("played-cards")


socket.on("joined", ()=>{ //change this in the future to change the message on the top
    id = socket.id;
    socket.emit("new_player", {username, roomcode, id})
    for(let x=0; x<10; x++){
        socket.emit("pull", "perks")
    };
    for(let x=0; x<5; x++){
        socket.emit("pull", "flags")
    };
});

socket.on("new_card", (card, type) =>{
    hand = document.querySelector(".scrollmenu")
    cards.push(card)
    thing = document.createElement("div")
    thing.setAttribute("class", (type === "perks" ? "white" : "red") + " card")
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
            presenter = room["players"].find(user => user.order ===room["data"]["turn"])["username"]
            message.innerText = `${presenter} is presenting their candidate`
            played.innerHTML = ""
            if (presenter === username){
                you = room["players"].find(user => user.username === username)
                message.innerText = "you are presenting your candidate, press next to reveal your cards"
                button.innerText = "next"
                button.style.display = "inline-block"
            }
        }
})

socket.on("show", (card)=>{
    thing = document.createElement("div")
    thing.setAttribute("class", (room["data"]["state"] === "presenting" ? "white" : "red") + " card")
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
                if (selected.parentElement.id === "hand" && played.children.length < 1 && selected.classList.value === "red card"){
                    destination = document.getElementById("played-cards")
                } else {
                    destination = document.getElementById("hand") 
                }
                console.log(played.children.length)
                selected.parentElement.removeChild(selected)
                destination.appendChild(selected)
                button.style.display = played.children.length === 1 ? "inline-block" : "none"
                break;
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
                socket.emit("change_phase", roomcode)
                button.style.display = "none"
            } else {
                alert("need at least 3 players to begin")
            }
            break;
        case "white" || "red": 
            var submit_cards = []
            for (let x=0; x < played.children.length;x++){
                if(cards[parseInt(played.children[x].id)-1]["Custom"]){
                    create_custom(played.children[x].id)
                }
                submit_cards.push(played.children[x].innerText)
            }
            socket.emit("submitCards",roomcode, username, submit_cards)
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
    }
}