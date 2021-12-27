const socket = io();
const cards= [];
//https://avatars.dicebear.com/api/avataaars/(seed here).svg, use an image tag with this as the src=
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
    cards.push(card)
    if (type=="perks") {
        
        thing.setAttribute("class", "white card");
    } else {
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
    thing.setAttribute("id", cards.length)
    thing.setAttribute("ondblclick", `select(${cards.length})`)
    hand.appendChild(thing)
});

socket.on("add_player", (usernames)=>{
    score = document.querySelector(".players-menu select");
    score.innerHTML = "";
    var player = document.createElement("option");
    player.classList.add("player");
    for(x in usernames){
        player.textContent = usernames[x]["username"] + ": " + usernames[x]["score"]
        score.appendChild(player.cloneNode(true))
    };
});

function select(id){
    var selected = document.getElementById(id)
    destination = document.getElementById("upper-half")
    if (selected.parentElement.id === "hand" && destination.children.length < 2){
        destination = document.getElementById("upper-half")
        selected.parentElement.removeChild(selected)
        destination.appendChild(selected)
    } else {
        destination = document.getElementById("hand") //note to self, you can change this to that other thing
        selected.parentElement.removeChild(selected)
        destination.appendChild(selected)
    }
}