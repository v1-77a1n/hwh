//required modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');


//create app
const app = express();

//configure app
let port = 8080;
let host = 'localhost';
let url = 'mongodb://localhost:27017/NBAD'
app.set('view engine', 'ejs');

//Connect to MongoDB
mongoose.connect(url, 
    {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    //start server
    app.listen(port, host, ()=> {
        console.log('Server is running on port', port);
    })
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(session({
    secret: 'afhksdlxowq;s',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 480000},
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'})
}));

app.use(flash());

app.use((req, res, next)=> {
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.use('/', mainRoutes);

app.use('/connections', eventRoutes);

app.use('/user', userRoutes);

//configuring error messages
app.use((req, res, next)=> {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use ((err, req, res, next)=> {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }
    res.status(err.status);
    res.render('error', {err});
});

