const request = require('request');

var profileFetchOptions = (accessToken) => {
  var option = {
    url: 'https://api.spotify.com/v1/me',
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  };
  return option;
};

module.exports = {
  getInfo: (req, res) => {
    console.log(profileFetchOptions(req.body.access_token));
    request(profileFetchOptions(req.body.access_token), (error, response, body) => {
      if (!error && response.statusCode === 200) {
        res.json(body);
      } else {
        res.status(response.statusCode).json(body);
      }
    });
  }
}