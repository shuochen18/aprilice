var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser')

var app = express();
var nodemailer  = require('nodemailer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var pool = mysql.createPool({
    host:'8.211.4.94',
    user:'root',
    password:'Ns123456!',
    database:'aprilice',
    port:3306,
})

var mailTransport = nodemailer.createTransport({
    host : 'smtp.qq.com',
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth : {
        user : '245015259@qq.com',
        pass : 'cymwszyyffahbhga'
    },
});

app.get('/api/internel/getclientinfo',function(request, response){
    pool.getConnection(function(err,conn){
        if(err){
            response.send(err);
        }
        else{
            conn.query("SELECT * FROM clientinfo ORDER BY date DESC", function(err, resu, fields){
                conn.release();
                response.send(resu);
            })
        }
    })
}
)

app.post('/api/collectinfo',function(request, response){
    pool.getConnection(function(err,conn){
        if(err){
            response.send(err);
        }
        else{
            var obj ={
                name:request.body.name,
                phone:request.body.phone, 
                email:request.body.email,
                address:request.body.address,
                tcount: request.body.tcount
            }
            sendmail(obj); // send email
            console.log(request.body);
            conn.query(`INSERT INTO clientinfo (name,email,nop,address ) VALUES ('${obj.name}','${obj.email}','${obj.tcount}','${obj.address}');`, function(err, resu, fields){
                 conn.release();
                 response.send("success!");
            })
        }
    })

})

function sendmail(content){
    var options = {
        from        : '"aprilice" 245015259@qq.com',
        to          : '"receiver" 245015259@qq.com',
        // cc         : ''  //抄送
        // bcc      : ''    //密送
        subject        : 'New Client',
        text          : JSON.stringify(content),
    };
    
    mailTransport.sendMail(options, function(err, msg){
        if(err){
            console.log(err);
        }
        else {
            console.log(msg);
        }
    });
}
app.use(express.static('./public', {index: './html/index.html'}))


app.listen(3000, console.log("listen on port 3000!"));