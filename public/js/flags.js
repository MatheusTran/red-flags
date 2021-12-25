const socket = io();
const red = [];
const white = [];

const {username, roomcode} = Qs.parse(location.search,{ignoreQueryPrefix: true});

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
    if (type=="perks") {
        white.push(card)
        thing.setAttribute("class", "white card");
    } else {
        red.push(card)
        thing.setAttribute("class", "red card");
    };
    thing.textContent = card["text"];
    if (card["Custom"]){
        br = document.createElement("br")
        thing.appendChild(br)
        custom = document.createElement("input")
        custom.classList.add("custom")
        custom.setAttribute("placeholder", "custom text")
        thing.appendChild(custom)
    };
    hand.appendChild(thing)
});

socket.on("add_player", (usernames)=>{
    score = document.querySelector(".players-menu select");
    score.innerHTML = "";
    var player = document.createElement("option");
    player.classList.add("player");
    for(x in usernames){
        player.textContent = usernames[x]["username"]
        score.appendChild(player.cloneNode(true))
    };
});
