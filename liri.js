var keys = require("./keys.js");
var spotify = require('spotify');
var Twitter = require('twitter');
var fs = require("fs");
var request = require("request");
var command = process.argv[2];
var input = process.argv.slice(3);
var client = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret:  keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	});
	
var params = {
	screen_name: 'kepile140',
    count: 20
};




function execute(){

	switch (command) {
		 case "movie-this":
		   movie();
		   break;

		 case "spotify-this-song":
		   song();
		   break;

		 case "my-tweets":
		   tweets();
		   break;

		 case "do-what-it-says":
		   doWhat();
		   break;

		 default:
			fs.appendFile("log.txt", "Command: " + command + " is undefined \n");
		    console.log( "Command: " + command + " is undefined \n");
		    console.log( "-------------------------------------------------------------------\n");
			fs.appendFile("log.txt", "-------------------------------------------------------------------\n");

	};

}




function printResult(output, search){
	fs.appendFile("log.txt", command + " "+ search + "\n");
	console.log(command + " "+ search + "\n");
	for (prop in output) {
       fs.appendFile("log.txt", prop + ": " + output[prop] + "\n");
       console.log(prop + " = " + output[prop]);
	};

    console.log( "-------------------------------------------------------------------\n");
   	fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
}




function movie(){
	if (input[0] === undefined){
	   var movie ="mr+nobody";
    } else
    {    
		 var movie  = input.join("+");
	};
     
   

	request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&r=json", function(error, response, body) {


		var response = JSON.parse(body);
		if (response.Response === 'True') {
			console.log(response);
			
			var output = {
				Title: response.Title,
				Released: response.Year,
				Produced: response.Country,
				Language: response.Language,
				Plot: response.Plot,
				Actors: response.Actors,
			    Rotten_tomato: response.Ratings[1].Value,
			    url: response.tomatoURL,
			};
		 
		 	printResult(output, movie);
		}
		 else {
			fs.appendFile("log.txt", response.Error + " Error finding movie" + movie +"\n")	 
		 	console.log(response.Error + "  Error finding movie " + movie);
		    console.log( "-------------------------------------------------------------------\n");
			fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
			return;	 
		 	
		};
	});
	
}




function song() {
	if (input[0] === undefined){
	   var song ="the+sign+artist:ace+of+base";
    } else
    {    
		var song = input.join("+");
	};
	

    spotify.search({ type: 'track', query: song }, function(err, data) {
	    if ( err ) {
	        console.log('Error occurred trying to find song ' + song + ': ' + err);
	        fs.appendFile("log.txt", 'Error occurred trying to find song ' + song + ': ' + err + " \n")	 
			fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
		    console.log( "-------------------------------------------------------------------\n");
			
	        return;
	    }

	    var result = data.tracks.items[0];
		var output = {
		    Artist: result.artists[0].name,
		    Song: result.name,
		    Preview_url: result.preview_url,
			Album: result.album.name
		};
		printResult(output, song);

  });
}




function tweets(){

	
	fs.appendFile("log.txt", command + "\n");
	console.log(command + "\n");

	client.get("statuses/user_timeline", params, function(error, tweets, response){
	
		if (!error) {
			
		  for (var i =  0; i<tweets.length; i++) {
		  	    var arr = tweets[i].created_at.split(" ");
		  	    var time = arr[0] + ", " + arr[1] + " " + arr[2] + ", " + arr[5] + " @ " + arr[3];
			  	console.log(  time + ": " + tweets[i].text + "\n");
			  	fs.appendFile("log.txt", time + ": " + tweets[i].text + "\n"); 	
		  	}; 

		} else
	    {
		    fs.appendFile("log.txt", "Could not retrieve your tweets.  Error: " + error + "\n");
		    console.log("log.txt", "Could not retrieve your tweets.  Error: " + error);
	    };
	    console.log( "-------------------------------------------------------------------\n");
	    fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
	});
}




function doWhat(){

	console.log(command + "\n");
  	fs.appendFile("log.txt", command + "\n"); 	
	fs.readFile("random.txt", "utf8", function(err, data){
		if (err){
			fs.appendFile("log.txt", "Could not read the file random.txt. Error: " + err + "\n");
			console.log("Could not read the file random.txt. Error: " + err);
		    console.log( "-------------------------------------------------------------------\n");
			fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
		    return;
		};
				console.log("File contains: " + data);
				fs.appendFile("log.txt", "File contains: " + data);
				var data = data.split(",");
				command = data[0];
				input = data.slice(1);
				
				execute();

		
	});
}




execute();