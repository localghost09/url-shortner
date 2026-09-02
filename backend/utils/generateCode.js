const chars =  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateCode(length = 6){
    let code = "";
    for(let i =0; i<length; i++){
        code += chars[Math.floor(Math.random()*chars.length)];
    }
    return code;
}

module.exports = generateCode;