const socket = io();
cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});
const message = document.querySelector(".msg-box")
button = document.querySelector("#player-button")

socket.on("joined", ()=>{
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

function select(id){
    var selected = document.getElementById(id)
    var played = document.getElementById("played-cards")
    switch (room["data"]["state"]){
        case "white": 
            if (selected.parentElement.id === "hand" && played.children.length < 2 && selected.classList.value === "white card"){
                destination = document.getElementById("played-cards")
            } else {
                destination = document.getElementById("hand") //note to self, you can change this to that other thing
            }
            selected.parentElement.removeChild(selected)
            destination.appendChild(selected)
            button.style.display = played.children.length === 2 ? "inline-block" : "none"
            break;

        case "red":
            if (selected.parentElement.id === "hand" && played.children.length < 1 && selected.classList.value === "red card"){
                destination = document.getElementById("played-cards")
            } else {
                destination = document.getElementById("hand") //note to self, you can change this to that other thing
            }
            console.log(played.children.length)
            selected.parentElement.removeChild(selected)
            destination.appendChild(selected)
            button.style.display = played.children.length === 1 ? "inline-block" : "none"
            break;
        

    }
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
            } else {
                alert("need at least 3 players to begin")
            }
            break;
        case "white": //note to self, only let the button show if the right cards are played
            play = document.getElementById("played-cards")
            if ((play.children[1].classList.value && play.children[0].classList.value) === "white card"){
                socket.emit("increment", roomcode)
            } else {
                alert("play two white cards")
            }
            break;
        case "red":
            play = document.getElementById("played-cards")
            if (play.children[0].classList.value === "red card"){
                socket.emit("increment", roomcode)
            } else {
                alert("play a red card")
            }
            break;
        case "presenting":
            socket.emit("increment", roomcode)
            break;
    }
}