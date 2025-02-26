import update from "./update.js";

console.assert(update("---------",1,0), 
    {"gameState":"X--------",
    "result":"continue"}
)

console.assert(update("X--------",0,1), 
    {"gameState":"XO-------",
    "result":"continue"}
)