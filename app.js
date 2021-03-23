const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const connection = require('./config/db');
const flash = require('express-flash-messages');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
// app.use(express.limit(100000000));
app.use(flash());
app.use((req, res, next) => {
    if (typeof(req.session.userid) == 'undefined') {
        req.session.userid = 0;
    };
    next();
});

const login = require('./routes/login');
const register = require('./routes/register');
const profile = require('./routes/profile');
const user = require('./routes/user');
const match = require('./routes/match');
const search = require('./routes/search');
const connections = require('./routes/connections');
const notifications = require('./routes/notifications');
const logout = require('./routes/logout');
const validate = require('./routes/validate');
const update_pass = require('./routes/update_pass');
const forgot_pass = require('./routes/forgot_pass');

app.use('/login', login);
app.use('/register', register);
app.use('/profile', profile);
app.use('/user/:id', user);
app.use('/match', match);
app.use('/search', search);
app.use('/connections', connections);
app.use('/notifications', notifications);
app.use('/logout', logout);
app.use('/validate',validate);
app.use('/update_pass',update_pass);
app.use('/forgot_pass',forgot_pass);

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



