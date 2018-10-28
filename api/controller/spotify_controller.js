const spotify_manager = require('../managers/spotify_manager');
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Request stuff
const request = require('request');
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const projectId = process.env.GCP_PROJECT_ID;

// Datastore
const datastore = new Datastore({
  projectId: projectId,
});
const kind = 'AppToken'; // Kind for the entity
const name = 'app_auth_token'; // ID/Name of entity
const appTokenObjKey = datastore.key([kind, name]); // Cloud Datastore key for entity

const setAppToken = (tokenValue) => {
  var appTokenEntity = {
    key: appTokenObjKey,
    data: {
      token: tokenValue,
    },
  };

  datastore.save(appTokenEntity).then(() => {
    console.log(`Saved ${appTokenEntity.key.name}: ${appTokenEntity.data.token}`);
  }).catch(err => {
    console.error('ERROR:', err);
  });
}

const fetchAppToken = (callback) => {
  var appToken = ''
  var query = datastore.createQuery('AppToken').filter('__key__', '=', appTokenObjKey);

  datastore.runQuery(query).then((data) => {
    var token = data[0][0].token
    return callback(token);
  });
}

const sendAsJSON = (res, error, response, body) => {
  if (!error && response.statusCode === 200) {
    res.json(body);
  } else {
    res.status(response.statusCode).json(error);
  }
}

const genreFetchOptions = (accessToken) => {
  const option = {
    url: 'https://api.spotify.com/v1/browse/categories?limit=50&country=CA',
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  };
  return option;
};

const getAppToken = (callback) => {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'client_credentials'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      setAppToken(body.access_token);
      return callback(body.access_token);
    } else {
      return null;
    }
  });
}

// Export functions
module.exports = {
  allGenres: (req, res) => {
    fetchAppToken((token) => {
      request.get(genreFetchOptions(token), (error, response, body) => {
        if (!error && response.statusCode === 200) {
          spotify_manager.filterGenres(body);
          res.json(body);
        } else if (response.statusCode === 401) {
          getAppToken(token => {
            request.get(genreFetchOptions(token), (error, response, body) => sendAsJSON(res, error, response, body)); 
          });
        } else {
          res.status(response.statusCode).json(error);
        }
      }); 
    });
  }
}
