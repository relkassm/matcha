const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const connection = require('./config/db');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (typeof(req.session.userid) == 'undefined') {
        req.session.userid = 0;
    };
    next();
});

const login = require('./routes/login');
const register = require('./routes/register');
const profile = require('./routes/profile');
const match = require('./routes/match');
const logout = require('./routes/logout');

app.use('/login', login);
app.use('/register', register);
app.use('/profile', profile);
app.use('/match', match);
app.use('/logout', logout);

app.listen(1337);

app.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.redirect('/login');
    else
        res.redirect('/profile');
});

app.get('/405', (req, res) => {
    if (req.session.userid == 0)
        res.redirect('/login');
    else
        res.render('405', { title: 'Error' });
});

app.use(function (req, res, next) {
    res.render('404', { title: 'Error' });
    next();
});


