var express = require('express'),
  everyauth = require('everyauth'),
  conf = require('./conf');

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  user = usersById[++nextUserId] = {id: nextUserId};
  user[source] = sourceUser;

  return user;
}


var usersByVkId = {};


everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.vkontakte
  .appId(conf.vkontakte.appId)
  .appSecret(conf.vkontakte.appSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, vkUserMetadata) {
//    debugger;
    return usersByVkId[vkUserMetadata.uid] ||
      (usersByVkId[vkUserMetadata.uid] = addUser('vkontakte', vkUserMetadata));
  })
  .redirectPath('/');

var app = express();
app.use(express.static(__dirname + '/public'))
  // .use(express.favicon())
  .use(require('body-parser').urlencoded({ extended: false }))
  .use(require('cookie-parser')('optional secret string'))
  .use(require('cookie-session')({ keys: ['key1', 'key2']}))
  .use(everyauth.middleware());

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('home');
});

app.listen(3000);

console.log('Go to http://localhost:3000');

module.exports = app;
