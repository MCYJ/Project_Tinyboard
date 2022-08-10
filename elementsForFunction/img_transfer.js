const mysql = require('mysql2');
const fs = require('fs');
const dbconfig = require('../config/dbconfig.json');

const connection = mysql.createConnection({
    host : dbconfig.host,
    user : dbconfig.user,
    password : dbconfig.password,
    database : dbconfig.database,
    debug : false
});

// local image to 
// readFileSync : waiting for completing to load an image
const jisu = {
    img : fs.readFileSync('./img/jisu1.jpg'),
    name : 'jisu'
}

const won = {
    img : fs.readFileSync('./img/won1.jpg'),
    name : 'won' 
}

const query = connection.query('INSERT INTO `animals` SET ? ', won, (err, result) => {
        if(err) {
            console.dir(err);
            return;
        }
        console.log('이미지 추가성공');
        console.dir(result);
});

connection.end();