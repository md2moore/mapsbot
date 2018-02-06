# mapsbot

MapsBot is a custom bot for slack that can be called to show a google maps image with directions from a given origin to a destination. Here an example of how it is used. 

You make a call to the MapsBot for directions between two locations using the proper formatting:

@MapsBot [origin] / [destination]

Then it will return you a map with the route superimposed onto it along with the duration of the trip. It will also allow you to change your mode of transportation after the fact with slack interactive message buttons.



In order to use this app you will need to be an administrator on your own slack channel.

In order to start using Mapsbot you will need:
  1. To install NodeJS.
  2. Download the code to your machine.
  3. In the MapsBot folder run "npm install" to install all the dependencies.
  4. Login to your slack account which should be an admin account. Then navigate to this link: "https://api.slack.com/apps". Click on create an app. Select a name for your app (probably should be MapsBot) and use your slack team as the dev environment. After the app is created, turn on incoming webhooks. Add a new webhook and allow it to post to a channel, for example general. Then add a bot user by navigating to the bot users tab. Next navigate to the OAuth and Permissions tab and scroll down to add a scope. Add the chat:write:bot scope permission and the search:read permission. Reinstall the app.
  
 5. Now open the index.js file in the mapsbot folder and replace "var botToken = process.env.MapsBotToken;" with "var botToken = [your bot user OAuth Token]".
 6. Now you must get an api key from google for their google maps static maps api and google maps directions api.
 7. Once you have those keys do the same thing as step five but for the static_key and directions_key variables.
 8. Go back into the slack applications settings and enable interactive components. You need to enter the url where the MapsBot will live. If you are running the MapsBot on localhost you can use ngrok to create a secure url to your own machine. Make sure the server is listening on port 3000 and the url ends in /slack/action.
 
You are now ready to run Mapbot. Use "node index.js" to run the bot. It will act as a server that waits for an incoming message. You can direct message the bot or message it in a channel by calling for it using @Mapsbot. The proper format for a request is:
 
 @MapsBot [origin] / [destination]
 
Where you substitute the words "origin" and "destination" with where you are and where you want to go. If it is not in this format Mapsbot will send a formatting error message back to you. Be as specific with your origins and destinations as possible for best results.
