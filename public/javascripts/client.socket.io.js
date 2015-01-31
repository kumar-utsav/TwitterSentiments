var server_name = "http://127.0.0.1:3000/"; // name of the server.
var socket = io.connect(server_name); // socket io instance.
console.log("Client connected to server " + server_name);
jQuery(function($){ 
	var lovetweetlist = $('ul.lovetweets'); // the html element for displaying love tweets on the index.html page.
    var hatetweetlist = $('ul.hatetweets'); // the html element for displaying hate tweets on the index.html page.
    var loveCount = $('li.love');  // the html element to display love percentage.
	var hateCount = $('li.hate');  // the html element to display hate percentage.
	var totalCount = $('li.total');  // the html element to display the total count of tweets

    var chart = new CanvasJS.Chart("chart", { // instantiate the CanvasJS object.
        theme: "theme2",
        animationEnabled: true
    });    

	socket.on('tweet', function(data){  // receives the twitter streaming data from the server.
		
        var text = data.text.toLowerCase(); // convert the text of the tweets to lower case.

        if(text.indexOf("love") != -1){
            lovetweetlist.prepend('<li>' + data.user + ': ' + text + '</li>'); // adds the love tweets to the lovetweetlist element
        }

        if(text.indexOf("hate") != -1){
            hatetweetlist.prepend('<li>' + data.user + ': ' + text + '</li>'); // adds the hate tweets to the lovetweetlist element
        }
        
        
		loveCount.text('LOVE: ' + data.love.toFixed(2) + '%'); // displaying the love tweets percentage.
		hateCount.text('HATE: ' + data.hate.toFixed(2) + '%'); // displaying the hate tweets percentage.
		totalCount.text('TOTAL: ' + data.totalCount);  // displaying the total tweet count.
       
        var config = {  // sets the chart's configuration parameters. 
            type: "bar",
            dataPoints: [
                {label: "Love", y: data.love},
                {label: "Hate", y: data.hate}
            ]
        };

        chart.options.data = [];
        chart.options.data.push(config); 
        
        chart.render(); // create the chart.

	});
});
