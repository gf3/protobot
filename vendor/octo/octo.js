var Octo = module.exports = {}
  , http = require( 'http' )
  , https = require( 'https' )
  , cache = {}

// Get GitHub User
Octo.user = function user ( username, hollaback ) {
  // Cached?
  if ( cache[ username ] ) {
    hollaback.call( null, undefined, cache[ username ] )
    return
  }

  api( '/users/' + username, function( err, data ) {
    if ( data && data.message && data.message == 'Not Found' )
      hollaback.call( null, data )
    else {
      cache[ username ] = data
      hollaback.call( null, err, data )
    }
  })
}

// Get Nerd Cred Score
Octo.score = function score ( username, hollaback ) {
  Octo.user( username, function( err, user ) {
    if ( err ) {
      hollaback.call( null, err )
      return
    }
    
    // Get repos
    api( '/repos/show/' + username, true, function( err, data ) {
      if ( err ) {
        hollaback.call( null, err )
        return
      }

      // XXX Totally arbitrary
      var score = 0

      score += user.followers * 2
      score += user.public_gists * 3
      score += user.public_repos * 4

      data.repositories.forEach( function( r ) {
        score += r.watchers
        score += r.forks * 5
      })

      score = score * 0.10
      hollaback.call( null, undefined, score )
    })
  })
}

// Make API Calls
function api ( endpoint, v2, hollaback ) {
  var options = {}
    , method

  if ( hollaback == undefined ) {
    hollaback = v2
    v2 = false
  }

  if ( v2 ) {
    options.host = 'github.com'
    options.path = '/api/v2/json' + endpoint
    options.port = 80
    method = http
  }
  else {
    options.host = 'api.github.com'
    options.path = endpoint
    method = https
  }

  ;;; console.log( options.path )

  method.get( options, function( res ) {
    var data = ''

    res.on( 'data', function( chunk ) {
      data += chunk
    }).on( 'end', function(){
      hollaback.call( null, undefined, JSON.parse( data ) )
    })

  }).on( 'error', function( err ) {
    hollaback.call( null, err )
  })
}

