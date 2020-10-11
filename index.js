var express = require('express');
var app = express();

app.use(express.static('./public', {index: './html/index.html'}))


app.listen(3000, console.log("listen on port 3000!"));