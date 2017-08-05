var mustache = require("mustache");
var nodeCache = require("node-cache");
var pageCache = new nodeCache();
var getWikiTextAndUrl = require("../utils/wiki.js");
var getRssFeed = require("../utils/rss.js");

var getPageContent = function(config, fail, success) {
	if (config.hostNames[config.hostKey]) {
		if (pageCache.get(config.hostKey)) {
			success(pageCache.get(config.hostKey));
		} else {
			var pageConfig = Object.assign({}, config.hostNames[config.hostKey]);

			getWikiTextAndUrl(pageConfig.wiki.articleTitle, pageConfig.wiki.sectionTitle, fail, function(wikiText, wikiUrl) {
				getRssFeed(pageConfig.news.rssFeed, fail, function(newsEntries) {
					pageConfig.hostName = config.hostKey;
					pageConfig.canoncialhostName = "http://" + config.hostKey + "/";
					pageConfig.canoncialhostNameEncoded = encodeURIComponent("http://" + config.hostKey + "/");
					
					pageConfig.wiki.articleContent = wikiText;
					pageConfig.wiki.articleUrl = wikiUrl;
					pageConfig.news.entries = newsEntries;

					pageCache.set(
						config.hostKey,
						mustache.render(config.indexFileText, pageConfig),
						config.expireSeconds
					);
					
					success(pageCache.get(config.hostKey));
				});
			});
		}
	} else {
		fail();
	}
};

module.exports = function(port, hostNames, indexFileText, expireSeconds) {
	return function(req, res, next) {
		var config = {
			hostNames: hostNames,
			hostKey: req.headers.host.replace(".localhost:" + port, ""),
			indexFileText: indexFileText,
			expireSeconds: expireSeconds
		};
		
		var fail = function() {
			res.status(500).send({message: "An unknown error has occurred."});
		};
		
		var success = function(pageContent) {
			res.send(pageContent);
		};

		getPageContent(config, fail, success);
	};
};