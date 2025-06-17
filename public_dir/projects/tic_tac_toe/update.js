export default function update(gameString, xToMove, moveNumber){
    const gameState = gameString.split("");
    let result = "continue";

    const winLineList = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // perform move
    if (gameState[moveNumber] === "-") {
        gameState[moveNumber] = xToMove ? "X" : "O";
        xToMove = xToMove ? 0 : 1;
    } else {
        return {
            "gameString": gameState.join(""),
            "xToMove": xToMove,
            "result": "invalid"
        };
    }

    // determine winner
    for (const winLine of winLineList) {
        const [a, b, c] = winLine;
        const c1 = gameState[a], c2 = gameState[b], c3 = gameState[c];
        if (c1 === c2 && c2 === c3 && (c1 === "X" || c1 === "O")) {
            result = `${c1} win`;
        }
    }

    return {
        "gameString": gameState.join(""),
        "xToMove": xToMove,
        "result": result
    };
}


//console.log(update("---------",1,0));
//console.log(update("X--------",0,3));
//console.log(update("X--O-----",1,1));
//console.log(update("XX-O-----",1,2));
//console.log(update("OXX-O-X--",0,8));