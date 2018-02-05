var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var https = require('https');
var http = require('http');
var qs = require('qs');

var botToken = process.env.MapsBotToken;
var static_url = "https://maps.googleapis.com/maps/api/staticmap?size=600x600&path=enc:"
var static_key = process.env.GoogleStaticKey;
var directions_key = process.env.GoogleDirectionsKey;
var polyline;
var duration;

var rtm = new RtmClient(botToken);
rtm.start();

var user_id;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    user_id = rtmStartData.self.id;
    console.log(`Authenticated: Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log("Connection Opened");
});

//When any message gets sent in slack team respond to event
rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    console.log("Message Event Received");
    
    //If message received is already from the bot or mapsbot sents back an interactive message, don't process event. 
    if ( (message.subtype && message.subtype === 'bot_message') || (!message.subtype && message.user === user_id) || message.subtype == 'message_changed') {
        console.log("Bot Message / Existing Message Update Received");
    } else { 
        var message_text = message.text;
        var message_channel = message.channel;

        //Only process messages that specifically requests "@Mapsbot" in the message text
        if(message.user != user_id && message_text.includes(`@${user_id}`)){
            if(!message_text.includes("/")){
                console.log("Invalid Format");
                sendFormattingError("format", message_channel);
            } else {
                message_text = message_text.replace(`<@${user_id}>`, '');
                var message_array = message_text.split('/');
                if(message_array.length != 2){
                    sendFormattingError("format", message_channel);
                } else {
                    var origin = message_array[0].trim();
                    var destination = message_array[1].trim();
                    console.log("Processing message with origin: " + origin + " and destination: " + destination);

                    //Request url of google maps directions api to get polyline of route to superimpose on static map image.
                    var directions_url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}
                        &destination=${destination}&key=${directions_key}`;

                    https.get(directions_url, res => {
                        res.setEncoding("utf8");
                        let body = "";
                        res.on("data", data => {
                            body += data;
                        });
                        res.on("error", (e) => {
                            console.log("Directions API Error: " + error);
                            sendFormattingError("direction request error", message_channel);
                        })
                        res.on("end", () => {
                            body = JSON.parse(body);
                            if (body.status == "ZERO_RESULTS" || body.status == "NOT_FOUND" || body.status == "INVALID_REQUEST"){
                                console.log("Directions API did not find route between origin or destination");
                                sendFormattingError("zero results", message_channel);
                            } else {
                                //Retrieve the polyline from the directions response and put together static map to send back to slack user.
                                polyline = body.routes[0].overview_polyline.points;
                                duration = body.routes[0].legs[0].duration.text;

                                setTimeout(function() {
                                    var image_url = static_url + polyline + "&key=" + static_key;
                            
                                    var bodyString = JSON.stringify({
                                        "token": "",
                                        "channel" : `${message_channel}`,
                                        "attachments": [
                                            {
                                                "fallback" : "Map Could Not Be Loaded",
                                                "title": `driving from ${origin} to ${destination} takes ${duration}`,
                                                "image_url": `${image_url}`
                                            },
                                            {
                                                "fallback": "Want Another Mode of Transportation?",
                                                "title": "Want Another Mode of Transportation?",
                                                "callback_id": "testing",
                                                "color": "#3AA3E3",
                                                "attachment_type": "default",
                                                "actions": [
                                                    {
                                                        "name": "drive",
                                                        "text": "Drive",
                                                        "type": "button",
                                                        "value": `driving/${origin}/${destination}`
                                                    },
                                                    {
                                                        "name": "transit",
                                                        "text": "Public Transit",
                                                        "type": "button",
                                                        "value": `transit/${origin}/${destination}`
                                                    },
                                                    {
                                                        "name": "Walk",
                                                        "text": "Walk",
                                                        "type": "button",
                                                        "value": `walking/${origin}/${destination}`
                                                    }
                                                ]
                                            }
                                        ]
                                    });
                            
                            
                                    const options = {
                                        hostname: 'slack.com',
                                        path: '/api/chat.postMessage',
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${botToken}`
                                        }
                                    };
                                    
                                    const req = https.request(options, (res) => {
                                        console.log("Sending Map To Slack Channel");
                                        res.setEncoding('utf8');
                                        res.on('error', (e) => {
                                            console.error(`Error in posting map image to slack response: ${e.message}`);
                                            sendFormattingError("slack request error", message_channel);
                                        });
                                    });
                            
                                    req.on('error', (e) => {
                                        console.error(`Error in posting map image to slack request: ${e.message}`);
                                        sendFormattingError("slack request error", message_channel);
                                    });
                                        
                                    req.write(bodyString);
                                    req.end();
            
                                }, 1000);
                            }
                        });
                    });    
                }
            }   
        }
    }
    
});

//If any error happens when processing a received message above, send a message back to the slack channel alerting the user.
var sendFormattingError = function(code, channel){
    const options = {
        hostname: 'slack.com',
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${botToken}`
        }
    };

    var error_text;
    if(code == "format"){
        error_text = "Formatting Error. The proper format is: \"@MapsBot origin / destination\". " + 
            "Replace the words \"origin\" and \"destination\" with where you are and where you want to go. " +
            "Be as specific as possible for best results.";
    } else if(code == "zero results"){
        error_text = "Google Maps came back with zero location results. Try changing your origin and destination or make them more specific.";
    } else if("direction request error"){
        error_text = "There was an error from google maps. Try again. Maybe with different or more specific locations.";
    } else if(code == "slack request error") {
        error_text = "There was an error sending your map over to slack. Try again.";
    } else if(code == "interactive message error") {
        error_text = "There was an error dealing with your button press.";
    } else {
        error_text = "Unknown Error.";
    }
    
    var bodyString = JSON.stringify({
        "token": `${botToken}`,
        "channel" : `${channel}`,
        "text": error_text
    });

    const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('error', () => {
            console.log('Error in Error Message Post Response');
        });
    });

    req.on('error', (e) => {
        console.error(`Error in Error Message Post Request: ${e.message}`);
    });
        
    req.write(bodyString);
    req.end();
}

//Localhost server to handle interactive message requests from slack.
http.createServer(function (req, response_top) {
    console.log("Received Interactive Message From User");
    let body = [];
    var newBodyString;
    
    req.on('data', (chunk) => {
        body.push(chunk);
    });
    req.on('error', () => {
        console.log("Error in the Interactive Message request");
        sendFormattingError("interactive message error", message_channel);
    })
    
    req.on('end', () => {
        //Deal with the json payload given from slack to extract the interactive button press.
        body = Buffer.concat(body).toString();
        var json_payload = qs.parse(body);
        json_payload = JSON.parse(json_payload.payload);

        var message_channel = json_payload.channel.id;
        var action_response_array = json_payload.actions[0].value.split("/");
        var origin = action_response_array[1];
        var destination = action_response_array[2];
        var travel_mode = action_response_array[0];

        //Send the newly updated travel mode to the Directions API.
        console.log("Sending new travel mode to Directions API");
        var directions_url = `https://maps.googleapis.com/maps/api/directions/json?origin=${action_response_array[1]}
                        &destination=${action_response_array[2]}&mode=${action_response_array[0]}&key=${directions_key}`;

        https.get(directions_url, res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("error", (e) => {
                console.log("Error in Interactive Messages Directions API call" + error);
                sendFormattingError("direction request error", message_channel);
            })
            res.on("end", () => {
                body = JSON.parse(body);
                if (body.status == "ZERO_RESULTS" || body.status == "NOT_FOUND" || body.status == "INVALID_REQUEST"){
                    console.log("Interactive Messages call to Directions API did not find route between origin or destination");
                    sendFormattingError("zero results", message_channel);
                } else {
                    polyline = body.routes[0].overview_polyline.points;
                    duration = body.routes[0].legs[0].duration.text;

                    var image_url = static_url + polyline + "&key=" + static_key;
                
                    newBodyString = JSON.stringify({
                        "token": `${botToken}`,
                        "channel" : `${message_channel}`,
                        "attachments": [
                            {
                                "fallback" : "Map Could Not Be Loaded",
                                "title": `${travel_mode} from ${origin} to ${destination} takes ${duration}`,
                                "image_url": `${image_url}`
                            },
                            {
                                "fallback": "Want Another Mode of Transportation?",
                                "title": "Want Another Mode of Transportation?",
                                "callback_id": "testing",
                                "color": "#3AA3E3",
                                "attachment_type": "default",
                                "actions": [
                                    {
                                        "name": "drive",
                                        "text": "Drive",
                                        "type": "button",
                                        "value": `driving/${origin}/${destination}`
                                    },
                                    {
                                        "name": "transit",
                                        "text": "Public Transit",
                                        "type": "button",
                                        "value": `transit/${origin}/${destination}`
                                    },
                                    {
                                        "name": "Walk",
                                        "text": "Walk",
                                        "type": "button",
                                        "value": `walking/${origin}/${destination}`
                                    }
                                ]
                            }
                        ]
                    });
                    response_top.on("error", (e) => {
                        console.log("Error in Interactive Messages Response" + error);
                        sendFormattingError("interactive message error", message_channel);
                    });
                    response_top.writeHead(200, {'Content-Type': 'application/json'});
                    response_top.write(newBodyString)
                    response_top.end();

                }
            });
        });

        
    });
}).listen(3000);

