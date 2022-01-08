const socket = io();
cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});
const message = document.querySelector("#msg-box")
button = document.querySelector("#player-button")
played = document.getElementById("played-cards")
Left = document.querySelector(".left") 
Right = document.querySelector(".right")


socket.on("joined", ()=>{
    id = socket.id;
    socket.emit("new_player", {username, roomcode, id})
    for(let x=0; x<15; x++){
        socket.emit("pull", "white")
    }; //if every room has a seperate deck, then this has to emit the room code as well
    for(let x=0; x<10; x++){
        socket.emit("pull", "red")
    };
});

socket.on("new_card", (card, type) =>{
    if (!cards.find(check => check === card)){
        hand = document.querySelector("#hand")
        cards.push(card)
        thing = document.createElement("div")
        thing.setAttribute("class", type + " card") 
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
        if (type==="red"){
            hand.appendChild(thing)
        } else {
            hand.insertBefore(thing, hand.firstChild)
        }
    } else {
        socket.emit("pull", type) //this redraws a new card in the event of the same card
    }
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
    //is_in = !(room["waiting"].find(user => user.username === username) === undefined)
    switch(room["data"]["state"]){
        case "awaiting"://this is kind of pointless
            message.innerText = "waiting for host to start the game"
            button.innerText = "start"
            button.style.display = room["players"].find(user => user.username === username)["admin"]? "inline-block" : "none" 
            played.innerHTML =""
            break;
        case "white":
            played.innerHTML=""
            Left.style.display = "none"
            Right.style.display = "none"
            if (room["players"].find(user => user.username === username)["swiper"]){
                message.innerText = "You are lonely and looking for a fish to fill the empty void that is your heart. Don't worry, you'll find someone eventually"
                socket.emit("increment", roomcode)//I might have to remove this later in the future
                button.style.display = "none"
                break;
            }
            message.innerText = `${room["players"].find(user => user.swiper)["username"]} is looking for love, play two white cards`
            button.innerText = "confirm"
            break;
        case "presenting":
            you = room["players"].find(user => user.order === room["data"]["turn"]) //wait a second this is basically the same as var "you", I can change this later
            played.innerHTML = ""
            if (you["username"] === username){
                message.innerText = "you are presenting your fish, press next to reveal your cards"
                button.innerText = "next"
                button.style.display = "inline-block"
                opacity(you["played"])
                break;
            }
            message.innerText = `${you["username"]} is presenting their fish`
            break;
        case "red":
            flagger = room["players"].find(user => user.order ===room["data"]["turn"])
            //might change this to an if else statement 
            flagged = flagger["order"] === 1 ? room["players"].find(user => user.order === room["players"].length-1) : room["players"].find(user => user.order === room["data"]["turn"]-1)
            played.innerHTML = ""
            if (flagger["username"] === username){
                you = room["players"].find(user => user.username === username)
                message.innerText = `you are ruining ${flagged["username"]}'s fish, play a red card`
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
                message.innerText = "swipe left to see the next fish, swipe right to choose your lover"
                Left.style.display = "flex"
                Right.style.display = "flex"
                socket.emit("present", roomcode, candidate["played"][0], "white")
                socket.emit("present", roomcode, candidate["played"][1], "white")
                socket.emit("present", roomcode, candidate["played"][2], "red")
                break;
            }
            message.innerText = `${swiper["username"]} is searching for their one true lover`
            break;
        }
})

socket.on("show", (card, type)=>{
    thing = document.createElement("div")
    thing.setAttribute("class", type + " card") 
    thing.textContent = card;
    if (type==="red"){
        played.appendChild(thing)
    } else {
        played.insertBefore(thing,played.firstChild)
    }
})

function select(id){//this is to select the cards
    if (!room["players"].find(user => user.username === username)["swiper"]){
        var selected = document.getElementById(id)
        switch (room["data"]["state"]){
            case "white": 
                if (selected.parentElement.id === "played-cards"){ //switch this around later, add an elif
                    destination = document.getElementById("hand")
                    selected.parentElement.removeChild(selected)
                    destination.insertBefore(selected, destination.firstChild)
                } else if(played.children.length < 2 && selected.classList.value === "white card") {          
                    selected.parentElement.removeChild(selected)
                    played.appendChild(selected)
                }
                button.style.display = played.children.length === 2 ? "inline-block" : "none"
                break;

            case "red":
                if (flagger["username"]===username){
                    if (selected.parentElement.id === "hand" && played.children.length <3 && selected.classList.value === "red card"){
                        destination = document.getElementById("played-cards")
                    } else {
                        destination = document.getElementById("hand") 
                    }
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
            for (let x=0; x < 2;x++){
                if(cards[parseInt(played.children[x].id)-1]["Custom"]){
                    create_custom(played.children[x].id)
                }
                cards[parseInt(played.children[x].id)-1] = "bleh"//this means nothing, it is basically just to remove the card
                socket.emit("submitCards",roomcode, username, played.children[x].innerText)
            }
            socket.emit("increment", roomcode)
            message.innerText = "Waiting for others"
            button.style.display = "none"
            break;
        case "presenting":
            if (you["played"].length > 0){
                if (played.firstChild.classList.value === "opacity white card"){
                    played.removeChild(played.firstChild)
                } else {
                    played.removeChild(played.lastChild)
                }
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

function opacity(plays){
    thing = document.createElement("div")
    thing.setAttribute("class", "opacity white card")
    thing.textContent = plays[0];
    played.appendChild(thing.cloneNode(true))
    thing.textContent = plays[1];
    played.appendChild(thing.cloneNode(true))
}

function bubbles(){
    heart = document.createElement("i")
    heart.setAttribute("class", "fas fa-heart bubble")
}