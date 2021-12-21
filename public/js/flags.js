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
    if (type=="perks") {
        white.push(card)
    } else {
        red.push(card)
    };
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
