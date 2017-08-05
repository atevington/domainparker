var path = require("path");
var Service = require("node-windows").Service;
var install = (process.argv[2] || "").trim().toLowerCase() !== "-u";

var svc = new Service({
	name: "Microsite Domain Parker",
	description: "Microsite Domain Parker Web Server",
	script: path.join(__dirname, "index.js")
});

if (install) {
	svc.on("install", function() {
		svc.start();
		console.log("Installed and started.");
	});

	svc.install();
} else {
	try {
		svc.uninstall();
		console.log("Stopped and uninstalled.");
	} catch(e) {}
}