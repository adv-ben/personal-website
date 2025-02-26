import update from "./update.js";

function getGameString(){
    let gameState = []
    for(let row = 0; row < 3; row++){
        for(let col = 0; col < 3; col++){
            const myDiv = document.querySelector("#div" + (row * 3 + col));

            if(myDiv.className == "squareDiv"){
                gameState.push("-");
            }else if(myDiv.className == "squareDivX"){
                gameState.push("X");
            }else if(myDiv.className == "squareDivO"){
                gameState.push("O");
            }
        }

    }
    return gameState.join("");
}

function updateGrid(gameString){
    //console.log(gameString);
    const gameState = gameString.split("");

    for(let row = 0; row < 3; row++){
        for(let col = 0; col < 3; col++){
            const myDiv = document.querySelector("#div" + (row * 3 + col));
            let c1 = gameState[row * 3 + col];

            if(c1 == "-"){
                myDiv.className = "squareDiv";

            }else if(c1 == "X"){
                myDiv.className = "squareDivX";
                if(!myDiv.hasChildNodes()){
                    var img = document.createElement("img");
                    img.className = "container";
                    img.src = "./X.jpeg";
                    myDiv.appendChild(img);
                }
            }else if(c1 == "O"){
                if(!myDiv.hasChildNodes()){
                    var img = document.createElement("img");
                    img.className = "container";
                    img.src = "./O.jpeg";
                    myDiv.appendChild(img);
                }
            }
        }
    }
}


var gridDiv = document.createElement("div");
gridDiv.className = "gridDiv";

for(let row = 0; row < 3; row++){
    var rowDiv = document.createElement("div");
    rowDiv.className = "rowDiv";
    for(let col = 0; col < 3; col++){
        var squareDiv = document.createElement("div");
        squareDiv.className = "squareDiv";
        squareDiv.id = "div" + (row * 3 + col);
        rowDiv.appendChild(squareDiv);
    }
    gridDiv.appendChild(rowDiv);
}

document.getElementsByTagName("body")[0].appendChild(gridDiv);

let xToMove = 1;

for(let row = 0; row < 3; row++){
    for(let col = 0; col < 3; col++){
        const myDiv = document.querySelector("#div" + (row * 3 + col));

        myDiv.addEventListener("click", function(){
            let moveNumber = myDiv.id.charAt(myDiv.id.length -1);
            //console.log(moveNumber);
            let gameString = getGameString();
            //console.log(gameString);
            let res = update(gameString ,xToMove, moveNumber)
            xToMove = res.xToMove;
            gameString = res.gameString;
            //console.log(res.gameString, res.result);
            updateGrid(res.gameString);
        });
    }
}