var parser = require("rss-parser");
var qs = require("qs");
var jsdom = require("jsdom");
var jQuery = require("jquery")((new jsdom.JSDOM()).window);

module.exports = function(url, fail, success) {
	parser.parseURL(url, function(error, parsed) {
		if (!error) {
			parsed.feed.entries.map(function(entry) {
				entry.title = jQuery("<div>" + entry.title + "</div>").text();
				entry.content = jQuery("<div>" + entry.content + "</div>").text();
				entry.link = qs.parse(entry.link).url ? qs.parse(entry.link).url : entry.link;
			});
			
			success(parsed.feed.entries);
		} else {
			fail();
		}
	});
};