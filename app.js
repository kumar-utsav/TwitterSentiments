var express = require('express'); // includes express module
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitter = require('ntwitter');  // includes the ntwitter module for interacting with Twitter API. 

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express(); //It instantiates Express and assigns our app variable to it. 

var server = require('http').createServer(app); // includes http module and set it to variable 'server' and invokes createServer function to start a basic HTTP server and server is linked to the express object.

var port = 3000; // port set to 3000 on which http server will listen.

server.listen(port); // server asked to listen on the specified port.

console.log("Server started at http://127.0.0.1:" + port);

var sio = require('socket.io').listen(server); //includes socket.io module and attach it to the http server. 

var twit = new twitter({  // instantiates the twitter api with the keys and secrets.
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var total = 0; // counter to count the total number of tweets.
var love = 0;  // counter to count the love tweets
var hate = 0;  // counter to count the hate tweets

sio.sockets.on('connection', function(socket){ //tasks to be performed on receiving connection request.

	twit.stream('statuses/filter', {track: ['love', 'hate']}, function(stream){  // filter out the tweets containing love or hate words.
		stream.on('data', function(data){
			var text = data.text.toLowerCase();
			if(text.indexOf("love")!=-1){  // check for love tweets and increment the love and total counts.
				love++;
				total++;
			}
			if(text.indexOf("hate")!=-1){  // check for hate tweets and increment the hate and total counts.
				hate++;
				total++;
			}
			
			socket.volatile.emit('tweet', {  // filter out user's name and tweet from the streaming data and emit to the client along with the love and hate percentages and the total tweet count.
                image: data.user.profile_image_url_https,
                user: data.user.screen_name,
				text: data.text,
				love: (love/total)*100,
				hate: (hate/total)*100,
				totalCount: total
			});
		});
	});

	socket.on('disconnect', function(){  // on disconnect request.
		console.log('Web client disconnected');
	});
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
