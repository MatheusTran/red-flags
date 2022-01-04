const socket = io();
cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});
const message = document.querySelector("#msg-box")
button = document.querySelector("#player-button")

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
    thing = document.createElement("div")
    cards.push(card)
    thing.setAttribute("class", (type === "perks" ? "white" : "red") + " card")
    thing.textContent = card["text"];
    if (card["Custom"]){
        thing.appendChild(document.createElement("br"))
        custom = document.createElement("input")
        custom.classList.add("custom")
        custom.setAttribute("placeholder", "custom text")
        thing.appendChild(custom)
    };
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
        case "white":
            if (room["players"].find(user => user.username === username)["swiper"]){
                message.innerText = "you are the swipper, wait for others"
                socket.emit("increment", roomcode)
                break;
            }
            message.innerText = "pick two white cards"
            button.innerText = "confirm"
            break;
        case "waiting":
            message.innerText = "waiting for others"
            break;
    }
})

function select(id){//this is to select the cards
    if (!room["players"].find(user => user.username === username)["swiper"]){
        var selected = document.getElementById(id)
        var played = document.getElementById("played-cards")
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
            submit = document.getElementById("played-cards")
            var submit_cards = []
            for (let x=0; x < submit.children.length;x++){
                if(cards[parseInt(submit.children[x].id)-1]["Custom"]){
                    create_custom(submit.children[x].id)
                }
                submit_cards.push(submit.children[x].innerText)
            }
            socket.emit("submitCards",roomcode, username, submit_cards)
            socket.emit("increment", roomcode)
            button.style.display = "none"
            break;
        case "presenting":
            socket.emit("increment", roomcode)
            break;
    }
}