export default function update(gameString, xToMove, moveNumber){
    //console.log(2);
    //console.log(typeof gameString);
    const gameState = gameString.split("");
    let result = "continue"
    //console.log(gameState);

    let winLineList = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // check wins
    for(const winLine of winLineList){
        let c1 = gameState[winLine[0]];
        let c2 = gameState[winLine[1]];
        let c3 = gameState[winLine[2]];
        if(c1 == c2 && c2 == c3){
            if(c1 == "X" || c1 == "O"){
                return {"gameString":gameState.join(""),
                    "xToMove":xToMove,
                    "result":"invalid"}
            }
        }
    }

    // perform move
    if(gameState[moveNumber] == "-"){
        if(xToMove){
            gameState[moveNumber] = "X";
        }else{
            gameState[moveNumber] = "O";
        }
        xToMove = xToMove == 1 ? 0 : 1;
    }else{
        // invalid move
        return {"gameString":gameState.join(""),
        "xToMove":xToMove,
        "result":"invalid"}
    }

    // determine winner
    for(const winLine of winLineList){
        let c1 = gameState[winLine[0]];
        let c2 = gameState[winLine[1]];
        let c3 = gameState[winLine[2]];
        if(c1 == c2 && c2 == c3){
            if(c1 == "X"){
                result = "X win";
            }else if(c1 == "O"){
                result = "O win";
            }
        }
    }
    return {"gameString":gameState.join(""),
    "xToMove":xToMove,
    "result":result}
}

//console.log(update("---------",1,0));
//console.log(update("X--------",0,3));
//console.log(update("X--O-----",1,1));
//console.log(update("XX-O-----",1,2));
//console.log(update("OXX-O-X--",0,8));