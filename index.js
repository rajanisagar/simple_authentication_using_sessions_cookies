const express = require('express');
const bcrypt = require('bcryptjs')
const app = express();
const session = require('express-session');
const MongoDBSession =  require('connect-mongodb-session')(session)
const mongoose = require('mongoose');   
const userModel = require('./models/users')



mongoose.connect('mongodb://localhost:27017/sessions', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
}).then(res => {
    console.log('Mongodb Conected')
})
    
const store = new MongoDBSession({
    uri: 'mongodb://localhost:27017/sessions',
    collection: 'mySessions'
})

app.set('view engine','ejs')
app.use(express.urlencoded({ extended: true}))

app.use(session({
    secret: 'key that with sign cookie',
    resave: false,
    saveUninitialized: false,
    store:store,
}))

const isAuth = (req,res,next) => {
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}

app.get('/', (req,res) => {
   res.render('landing')

})

app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/login', async (req, res) => {
    const {email, password}  = req.body

    const user =  await userModel.findOne({email})

    if(!user){
        return res.redirect('/login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.redirect('/login')
    }
    req.session.isAuth = true;
    res.redirect('/dashboard')
})

app.get('/register', (req, res) => {
    res.render('register')

})

app.post('/register', async (req, res) => {
    const { username, email, password} = req.body
    
    let user = await userModel.findOne({email})
    if(user){
        return res.redirect('/register')
    }

    const hashedPsw = await bcrypt.hash(password, 12) 

    user = new userModel({
        username,
        email,
        password: hashedPsw
    })

    await user.save();
    res.redirect('/login')
})

app.get('/dashboard', isAuth, (req, res) => {
    res.render('dashboard')
})

app.post('/logout', (req,res) =>{
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/')
        
    })
})


app.listen(5000, console.log('sever is listening at 5000'))