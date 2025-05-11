function update() {
    const b1 = document.getElementById("checkbox1").checked ? "T" : "F";
    const b2 = document.getElementById("checkbox2").checked ? "T" : "F";
    const b3 = document.getElementById("checkbox3").checked ? "T" : "F";
    
    const binaryClass = b1 + b2 + b3;
    document.getElementById("result").className = binaryClass;
}