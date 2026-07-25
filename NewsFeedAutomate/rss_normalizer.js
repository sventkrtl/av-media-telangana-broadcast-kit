/**
 * ============================================================
 * AV Media Telangana — NewsFeedAutomate
 * Unified RSS Normalizer (Stage 2)
 * Converts raw XML feed streams into Unified Internal Schema items.
 * ============================================================
 */

/**
 * Normalizes an array of RawFeed objects into Unified Internal Schema items.
 *
 * Input: Array<RawFeed>
 * Output Contract: Array<NormalizedFeedItem>
 * {
 *   Source: string,
 *   Priority: number,
 *   Title: string,
 *   Description: string,
 *   Link: string,
 *   PublishedTime: string | null,
 *   Category: Array<string>,
 *   Author: string,
 *   GUID: string,
 *   Language: string,
 *   Hash: null,
 *   Status: "NEW"
 * }
 *
 * @param {Array<Object>} rawFeeds - Array of RawFeed objects from RSS Collector.
 * @returns {Array<Object>} Array of NormalizedFeedItem objects.
 */
function parseRssFeeds(rawFeeds) {
  if (!rawFeeds || !Array.isArray(rawFeeds) || rawFeeds.length === 0) {
    return [];
  }

  var normalizedItems = [];

  for (var i = 0; i < rawFeeds.length; i++) {
    var feed = rawFeeds[i];
    if (!feed || !feed.success || !feed.rawXml) {
      continue;
    }

    var itemsFromFeed = parseSingleXmlFeed_(feed.rawXml, feed.source, feed.priority);
    for (var j = 0; j < itemsFromFeed.length; j++) {
      normalizedItems.push(itemsFromFeed[j]);
    }
  }

  return normalizedItems;
}

/**
 * Parses a single raw XML string into normalized item objects.
 * Supports XmlService with regex fallback for environment compatibility.
 */
function parseSingleXmlFeed_(rawXml, sourceName, priorityRank) {
  var items = [];

  if (typeof XmlService !== 'undefined' && typeof XmlService.parse === 'function') {
    try {
      var document = XmlService.parse(rawXml);
      var root = document.getRootElement();
      var channel = root.getChild('channel');

      if (channel) {
        var xmlItems = channel.getChildren('item');
        for (var k = 0; k < xmlItems.length; k++) {
          try {
            var normItem = parseXmlServiceItem_(xmlItems[k], sourceName, priorityRank);
            if (normItem) {
              items.push(normItem);
            }
          } catch (itemErr) {
            // Skip malformed item, continue processing remaining items
          }
        }
        return items;
      }
    } catch (xmlErr) {
      // Fall through to regex-based parser
    }
  }

  // Regex-based robust parser fallback
  return parseRegexXmlItems_(rawXml, sourceName, priorityRank);
}

/**
 * Parses a single XmlService Element (<item>).
 */
function parseXmlServiceItem_(itemElem, sourceName, priorityRank) {
  var dcNs = XmlService.getNamespace('dc', 'http://purl.org/dc/elements/1.1/');
  var contentNs = XmlService.getNamespace('content', 'http://purl.org/rss/1.0/modules/content/');

  var rawTitle = getElementText_(itemElem, 'title');
  var rawDesc = getElementText_(itemElem, 'description') || getElementTextWithNs_(itemElem, 'encoded', contentNs);
  var rawLink = getElementText_(itemElem, 'link');
  var rawGuid = getElementText_(itemElem, 'guid');
  var rawPubDate = getElementText_(itemElem, 'pubDate');
  var rawAuthor = getElementText_(itemElem, 'author') || getElementTextWithNs_(itemElem, 'creator', dcNs);

  var catElems = itemElem.getChildren('category');
  var categories = [];
  for (var c = 0; c < catElems.length; c++) {
    var catText = catElems[c].getText();
    if (catText) {
      categories.push(cleanTextValue_(catText));
    }
  }

  return createNormalizedItem_({
    source: sourceName,
    priority: priorityRank,
    title: rawTitle,
    description: rawDesc,
    link: rawLink,
    guid: rawGuid,
    pubDate: rawPubDate,
    categories: categories,
    author: rawAuthor
  });
}

/**
 * Regex-based XML item parser fallback. Handles namespaces and malformed tags safely.
 */
function parseRegexXmlItems_(rawXml, sourceName, priorityRank) {
  var items = [];
  var itemMatches = [...rawXml.matchAll(/<item[\s\S]*?>([\s\S]*?)<\/item>/gi)];

  for (var idx = 0; idx < itemMatches.length; idx++) {
    try {
      var itemBlock = itemMatches[idx][1];

      var rawTitle = extractTagContent_(itemBlock, 'title');
      var rawDesc = extractTagContent_(itemBlock, 'description') || extractTagContent_(itemBlock, 'content:encoded');
      var rawLink = extractTagContent_(itemBlock, 'link');
      var rawGuid = extractTagContent_(itemBlock, 'guid');
      var rawPubDate = extractTagContent_(itemBlock, 'pubDate');
      var rawAuthor = extractTagContent_(itemBlock, 'dc:creator') || extractTagContent_(itemBlock, 'author');

      var categories = extractAllTagContents_(itemBlock, 'category');

      var normItem = createNormalizedItem_({
        source: sourceName,
        priority: priorityRank,
        title: rawTitle,
        description: rawDesc,
        link: rawLink,
        guid: rawGuid,
        pubDate: rawPubDate,
        categories: categories,
        author: rawAuthor
      });

      if (normItem) {
        items.push(normItem);
      }
    } catch (e) {
      // Skip single malformed item
    }
  }

  return items;
}

/**
 * Helper to construct the Unified Internal Schema item object.
 */
function createNormalizedItem_(data) {
  var cleanTitle = (typeof sanitizeHeadlineText === 'function') ? sanitizeHeadlineText(data.title) : cleanTextValue_(data.title);
  var cleanDesc = (typeof stripHtml === 'function') ? cleanTextValue_(stripHtml(extractCdataValue_(data.description))) : cleanTextValue_(data.description);
  var cleanLink = cleanTextValue_(data.link);
  var cleanGuid = cleanTextValue_(data.guid) || cleanLink;
  var cleanAuthor = cleanTextValue_(data.author);

  var isoPubDate = (typeof toIsoUtcString === 'function') ? toIsoUtcString(data.pubDate) : data.pubDate;

  return {
    Source: data.source || "",
    Priority: data.priority || 0,
    Title: cleanTitle,
    Description: cleanDesc,
    Link: cleanLink,
    PublishedTime: isoPubDate,
    Category: data.categories || [],
    Author: cleanAuthor,
    GUID: cleanGuid,
    Language: "te",
    Hash: null,
    Status: "NEW"
  };
}

function getElementText_(parent, childName) {
  var child = parent.getChild(childName);
  return child ? child.getText() : "";
}

function getElementTextWithNs_(parent, childName, ns) {
  if (!ns) return "";
  var child = parent.getChild(childName, ns);
  return child ? child.getText() : "";
}

function extractTagContent_(xmlBlock, tagName) {
  var regex = new RegExp('<' + tagName + '[^>]*>([\\s\\S]*?)<\\/' + tagName + '>', 'i');
  var match = xmlBlock.match(regex);
  return match ? match[1] : "";
}

function extractAllTagContents_(xmlBlock, tagName) {
  var regex = new RegExp('<' + tagName + '[^>]*>([\\s\\S]*?)<\\/' + tagName + '>', 'gi');
  var matches = [...xmlBlock.matchAll(regex)];
  return matches.map(function (m) { return cleanTextValue_(m[1]); }).filter(Boolean);
}

function extractCdataValue_(val) {
  if (!val) return "";
  return (typeof extractCdata === 'function') ? extractCdata(val) : val.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function cleanTextValue_(val) {
  if (!val) return "";
  var text = extractCdataValue_(val);
  if (typeof stripHtml === 'function') text = stripHtml(text);
  if (typeof decodeHtmlEntities === 'function') text = decodeHtmlEntities(text);
  if (typeof normalizeWhitespace === 'function') text = normalizeWhitespace(text);
  if (typeof normalizeUnicode === 'function') text = normalizeUnicode(text);
  return text.trim();
}
