
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');
const cookie = require('cookie');

// connection pool을 활용하여 connection을 재사용함
// Database connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/img', static(path.join(__dirname, 'img')));
app.use('/css', static(path.join(__dirname, 'css')));

app.get('/', (req, res) => {
    res.sendFile('index.html', {root : __dirname});
});

app.post('/process/adduser', (req, res) => {
    console.log('/process/adduser 호출됨' + req);

    const paramId = req.body.id;
    const paramName = req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
            conn.release();
            console.log('error');
            res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
            res.write('<h1>DB서버 연결 실패/h1>');
            res.end();
            return;
        }
        console.log('success');

        const exec = conn.query('INSERT into users (id, name, age, password) values (?,?,?,SHA1(?))',
            [paramId, paramName, paramAge, paramPassword],
            (err, result) => {
                conn.release();
                console.log('실행된 SQL : '+exec.sql);
                if (err){
                    console.log('SQL 실행 시 오류 발생');
                    console.dir(err);
                    res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
                    res.write('<h1>SQL 실행 실패</h1>');
                    res.end();
                    return;
                }
                if (result) {
                    console.dir(result);
                    console.log('Inserted 성공');

                    res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
                    res.write('<h2>사용자 추가 성공</h2>');
                    res.end();
                }
                else {
                    console.log('Inserted 실패');

                    res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
                    res.write('<h1>사용자 추가 실패</h1>');
                    res.end();
                }
            }
        );
    });
});

app.post('/process/login', (req, res) => {
    console.log('/process/login 호출됨' + req);

    const paramId = req.body.id;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log(err);
            conn.release();
            console.log('error');
            res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
            res.write('<h1>DB서버 연결 실패/h1>');
            res.end();
            return;
        }
        console.log('success');
        
        const exec = conn.query(`SELECT * FROM users WHERE id=? and password=SHA1(?)`, 
        [paramId, paramPassword], 
        (err, result) => {
            conn.release();
            if (result == 0) {
                console.log('로그인 실패');
                res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
                res.write('<h1>사용자 확인불가</h1>');
                res.end();
            }
            else {
                console.dir(result);
                console.log('로그인 성공');
                res.cookie('userName', result[0].name);
                res.writeHead('200', {'Content-Type' : 'text/html; charset=utf8'});
                res.write(`<h2>${result[0].name} 님 안녕하세요?</h2>`);
                res.end();
            }
        })

    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});