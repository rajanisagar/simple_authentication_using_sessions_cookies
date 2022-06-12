const express = require('express');
const app = express();

app.get('/', (req,res) => {
    res.send('heelo')
})

app.listen(5000, console.log('sever is listening at 5000'))