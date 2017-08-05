var environment = require("dotenv").config();
var fs = require("fs");
var path = require("path");
var express = require("express");
var controllers = require("./controllers");

var app = express();
var port = process.env.PORT || 3000;
var cacheExpireSeconds = 10800; // 3 hours

function setUpRoutes(indexFileText, hostNames) {
	var basePageController = controllers.basePage(port, hostNames, indexFileText, cacheExpireSeconds);
	
	app.use("/", function(req, res, next) {
		if (req.path === "/") {
			basePageController(req, res, next);
		} else {
			next();
		}
	});
	
	app.use("/index.*", basePageController);
	
	app.use(express.static("public"));

	app.listen(port, function() {
		console.log("Listening on port " + port + ".");
	});
}

function readFile(filePath, callback) {
	fs.readFile(filePath, "utf-8", function(error, fileText) {
		if (!error) {
			callback(fileText);
		} else {
			console.log(error);
		}
	});
}

function init(indexFilePath, hostNamesFilePath) {
	readFile(indexFilePath, function(indexFileText) {
		readFile(hostNamesFilePath, function(hostNamesFileText) {
			setUpRoutes(indexFileText, JSON.parse(hostNamesFileText));
		});
	});
}

init(
	path.join(__dirname, "public", "index.html"),
	path.join(__dirname, "hostNames.json")
);