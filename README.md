# API for an mongoDB made editor
This is an API made of an mongoDB databas and express in JavaScript.

# Get started
This is an guide for how to get started and runing this API online.

## Download the repository
```
git clone https://github.com/jeso20BTH/editor-backend
```

## MongoDB
This is setup by mongoDB Atlas, therefor you are going to need an config-file for that site containing
"username" & "password", that file need to be named config.json, run the command
```
touch db/config.json
```
in repository location.

to get in to run on an online and not just locally your gonna need an service for that, this is an guide for that part.

## Azure App service
In Visual Studio Code, download Azure App Servie. Then run code from your repository and create an app service after your preferences.

When that part is done you can use link in any apps front and to access the API.

# How does it work
Requests of GET, POST PUT and DELETE all run from the <site-path>/db

## GET request
The get request does not need any input and will return an json-object with all data.

## POST request
It will create an new object, it does not need any body, but can take both name and HTML as parameters.
It will return an json-object with the _id of the created object.

## PUT request
Needs the _id as an parameter in its body, can take both name, and HTML as parameters. Returns no object.

## DELETE request
Needs the _id as an parameter in body, does not take any other parameters. Does not return any object.

## Reset the database
To reset the database, you go to the link <site-path>/db/reset, it will reset your database to what ever data you have configured in reset.json. It will then redirect you to <site-path>/db and get your reseted data.
