const functions = require("firebase-functions");

exports.artra = functions.https.onRequest((req, res) => {
  console.log('coucou')
  getOriginalRss(res);
})

const https = require('https')
const xml2js = require('xml2js')
const parseString = require('xml2js').parseString;

const blacklist = [
  "flutter",
  "python",
  "laravel",
  "php",
  "java ",
  "android",
  "crypto",
  "portfolio",
  "angular",
  "symfony",
  "vue ",
  "um ",
  "jquery",
  "golang",
  "wordpress",
  "django",
  "para "
]

function getOriginalRss(response) {
  const options = {
    hostname: 'dev.to',
    port: 443,
    path: '/feed',
    method: 'GET'
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    let data = [];
    res.on('data', function (chunk) {
      data.push(chunk);
    });

    res.on('end', function () {
      let str = Buffer.concat(data).toString();
      getXml(str, response);
    });
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}

function getXml(str, response) {
  parseString(str, function (err, result) {
    let filtered = filter(result);
    let rssFeed = getRss(filtered);
    //console.log(rssFeed.rss.channel[0].item.map(i => i.title[0]))
    //console.log(rssFeed)
    response.set("content-type", "text/xml; charset=utf8")
      .status(200)
      .send(rssFeed);
  });
}

function filter(xml) {
  const items = [];
  xml.rss.channel[0].item.forEach(function (item) {
    if (blacklist.every(word => !item.title[0].toLowerCase().includes(word))) {
      items.push(item);
    }
  })
  xml.rss.channel[0].item = items;
  return xml;
}

function getRss(str) {
  var builder = new xml2js.Builder();
  return builder.buildObject(str);
}