// the file keys holds twitter key
var keys = require("./keys.js");
// require spotify for song search
var spotify = require('spotify');
// require twitter api for tweet retrieval
var Twitter = require('twitter');
// use file system to read and append to files
var fs = require("fs");
// requre request for the OMDB movie database
var request = require("request");
// retrieve and store argument with the command to be executed
var command = process.argv[2];
// retrieve and store argument with any parameters to be used with the command
var input = process.argv.slice(3);
// store the twitter keys for the search
var client = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret:  keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	});
// set params for twitter.  Params set include the twitter name and 
// maximum number of tweets to be retrieved
var params = {
	screen_name: 'kepile140',
    count: 20
};




function execute(){
    console.log( "-------------------------------------------------------------------\n");
	fs.appendFile("log.txt", "-------------------------------------------------------------------\n");

	switch (command) {
		// retireve information about a movie 
		 case "movie-this":
		   movie();
		   break;

		// retireve information about a song 
		 case "spotify-this-song":
		   song();
		   break;

		// retireve tweets
		 case "my-tweets":
		   tweets();
		   break;

		// read a file and do what it says
		 case "do-what-it-says":
		   doWhat();
		   break;

		 default:
			fs.appendFile("log.txt", "Command: " + command + " is undefined \n");
		    console.log( "The command " + command + " is not recognized \n");
		    console.log( "Enter: movie-this with a movie name to get details about a movie.");
		    console.log( "Enter: spotify-this-song with a song name to get details about a song.");
		    console.log( "Enter: my-tweets to get details about your last 20 tweets.");
		    console.log( "Enter: do-what-it-says if you are a gambler!");
		

	};

}




function printResult(output, search){
	// log the command and its parameters
	fs.appendFile("log.txt", command + " "+ search + "\n");
	console.log(command + " "+ search + "\n");
	// loop thru the properties in the object and log the key and values
	for (prop in output) {
       fs.appendFile("log.txt", prop + ": " + output[prop] + "\n");
       console.log(prop + " = " + output[prop]);
	};

}




function movie(){
	// Check if a movie name was input and populate a movie name if blank
		
		
	if (input[0] === undefined || input[0] === " "  || input[0] === ""){
	    input[0] = "Mr";
	    input[1] = "Nobody";
	    var movie ="mr+nobody";
		var tomatoURL = "https://www.rottentomatoes.com/m/mr_nobody/"; 
    } else
    {
		

	    // Join the input together with connector accepted by omdb 
		var movie  = input.join("+");


		// create rotten tomato url artificially since no longer available in omdb database
		var tomatoURL = "https://www.rottentomatoes.com/m/";
		// if only 1 string was entered, seperate it into individual words
		// to change into the tomato url
		if (input[1] === undefined){
			input[0] = input[0].replace(/"/g, '');
			input = input[0].split(" ");

       		for (i=0; i<input.length; i++){
		
	console.log("i= " + input[i]);
	};
		};

		// loop thru movie name array
		for (i=0; i< input.length; i++){
			// remove any leading "the" because most of the url do not include it
			if (i === 0 && input[i].toLowerCase() === "the"){
				// do nothing
		    } 
		    // Do not place a "_" before the leading word in movie title for the url
		    else if (i === 0 || 
		    	     i === 1 && input[0].toLowerCase() === "the") {
				tomatoURL +=  input[i].toLowerCase();
		    } 
		    else {
				tomatoURL += "_" + input[i].toLowerCase();
			};
		};
		tomatoURL += ("/");
	};
 
   // query the omdb database
	request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&r=json", function(error, response, body) {

		// parse the response and check if it contains valid data
		var response = JSON.parse(body);
		// response was returned  	
		if (response.Response === 'True') {
			// console.log(response);
			// if the rotten tomto rating is not available, add message.  If its available, store it in variable   
			if 	(response.Ratings === undefined || response.Ratings[1] === undefined) {
				rating = "Not Available";
			}				
			else {
				rating = response.Ratings[1].Value;;
			};

			// store the data in an object for display
			var output = {
				Movie_Title: response.Title,
				Release_Year: response.Year,
				Country_Produced: response.Country,
				Language: response.Language,
				Plot: response.Plot,
				Actors: response.Actors,
			    Rotten_tomato_rating: rating,
			    Rotten_tomato_url: tomatoURL
			};

			 // print the response in console and file
		 	printResult(output, movie);
		}
		 else {
		 	// valid response was not returned so print error
			fs.appendFile("log.txt", response.Error + " Error finding movie" + input.join(" ") +"\n")	 
		 	console.log(response.Error + "  Error finding movie " +  input.join(" "));
			return;	 
		 	
		};
	});
	
}




function song() {
	// Check if a song name was input and populate a song name if blank
	if (input[0] === undefined || input[0] === " " || input[0] === ""){
	   var song ="the+sign+artist:ace+of+base";
    } else
    {    
    	// join song title arrau with connector "+" for search 
		var song = input.join("+");
	};
	

	
	// search the spotify api
    spotify.search({ type: 'track', query: song }, function(err, data) {
    	// console.log(JSON.stringify(data, null, 2));
		// if an error is returned or if nothing is returned in the response, log an error
	    if ( err || data.tracks.items[0] === undefined) {
	    	// clog any errors
	        fs.appendFile("log.txt", 'Error occurred trying to find song ' + input.join(" ") + ': ' + err + " \n")	 
	        console.log('Error occurred trying to find song ' + input.join(" ") + ': ' + err);
		    console.log( "-------------------------------------------------------------------\n");
			fs.appendFile("log.txt", "-------------------------------------------------------------------\n");
			
	        return;
	    };

	    // a valid response was returned so store results in an object
	    var result = data.tracks.items[0];
		var output = {
		    Artist: result.artists[0].name,
		    Song: result.name,
		    Preview_url: result.preview_url,
			Album: result.album.name
		};

		// print the object
		printResult(output, song);

  });
}




function tweets(){
    // log the command
	fs.appendFile("log.txt", command + "\n");
	console.log(command + "\n");

	// retrieve tweets from twitter
	client.get("statuses/user_timeline", params, function(error, tweets, response){
		// if Valid data is retrieved
		if (!error && tweets[0] != undefined) {
			// loop thru all the tweets retrieved and log them
		  for (var i =  0; i<tweets.length; i++) {
			  	 // store the created_at variable in an Arr to display a better format 
		  	    var arr = tweets[i].created_at.split(" ");
		  	    // store time stamp as dayofweek, month dayofmonth, year @ timeofday
		  	    var time = arr[0] + ", " + arr[1] + " " + arr[2] + ", " + arr[5] + " @ " + arr[3];
			  	console.log(  time + ": " + tweets[i].text + "\n");
			  	fs.appendFile("log.txt", time + ": " + tweets[i].text + "\n"); 	
		  	}; 

		} else
	    {
	    	// an error occured so log it
		    fs.appendFile("log.txt", "Could not retrieve your tweets.  Error: " + error + "\n");
		    console.log("log.txt", "Could not retrieve your tweets.  Error: " + error);
	    };
	});
}




function doWhat(){
	// log the command
	console.log(command + "\n");
  	fs.appendFile("log.txt", command + "\n"); 	
	// read the command to be executed
	fs.readFile("random.txt", "utf8", function(err, data){
		// if err is received, log it
		if (err){
			fs.appendFile("log.txt", "Could not read the file random.txt. Error: " + err + "\n");
			console.log("Could not read the file random.txt. Error: " + err);
		    return;
		};
		// log the data that was read
		console.log("File contains: " + data);
		fs.appendFile("log.txt", "File contains: " + data);
		//aplit the string by commas and store the data in a temp array
		var data = data.split(",");
		// for (i=0; i<data.length; i++){
		// 	console.log("line 270 data["+i+"] = " + data[i]);
		// };
		
		// store the command in var
		command = data[0];
		if (data[1] != undefined) {
			data[1] = data[1].trim();
		};
		// store the argument in input
		input = data.slice(1);
		console.log(data[1]);
	
		// call the execute function with the data that was read
		execute();

		
	});
}



// call function to start the process
execute();