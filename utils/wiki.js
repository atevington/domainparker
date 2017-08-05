var request = require("request");
var jsdom = require("jsdom");
var jQuery = require("jquery")((new jsdom.JSDOM()).window);

var makeWikiRequest = function(url, fail, success) {
	var baseUrl = "https://en.wikipedia.org/w/api.php?format=json&redirects=true";
	
	request(baseUrl + url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonResponse = JSON.parse(body);
			
			if (!jsonResponse.error) {
				success(jsonResponse);
			} else {
				fail();
			}
		} else {
			fail();
		}
	});
};

var getWikiSections = function(articleTitle, fail, success) {
	var url = "&action=parse&prop=sections&page=" + encodeURIComponent(articleTitle);
	
	makeWikiRequest(url, fail, function(response) {
		success(response.parse.pageid, response.parse.sections);
	});
};

var getWikiUrl = function(pageId, fail, success) {
	makeWikiRequest("&action=query&prop=info&inprop=url&pageids=" + encodeURIComponent(pageId), fail, function(response) {
		success(response.query.pages[pageId].canonicalurl);
	});
};

var getWikiSectionText = function(articleTitle, sectionTitle, sections, fail, success) {
	var filteredSection = sections.filter(function(section) {
		return section.line === sectionTitle;
	})[0];
	
	if (filteredSection) {
		var url = "&action=parse&prop=text&section=" + encodeURIComponent(filteredSection.index) + "&page=" + encodeURIComponent(articleTitle);

		makeWikiRequest(url, fail, function(response) {
			success(parseWikiText(response.parse.text["*"]));
		});
	} else {
		fail();
	}
};

var parseWikiText = function(wikiHTML) {
	var wikiDom = jQuery(wikiHTML);
	var outputDom = jQuery("<div>");
		
	jQuery("p", wikiDom).each(function() {
		jQuery("sup", this).remove();
		outputDom.append(jQuery("<p>").text(jQuery(this).text()));
	});

	return outputDom.html();
};

module.exports = function(articleTitle, sectionTitle, fail, success) {
	getWikiSections(articleTitle, fail, function(pageId, sections) {
		getWikiUrl(pageId, fail, function(wikiUrl) {
			getWikiSectionText(articleTitle, sectionTitle, sections, fail, function(wikiText) {
				success(wikiText, wikiUrl);
			});
		});
	});
};