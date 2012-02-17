var get = require( 'http' ).get
  , pipe_url = 
    { host: "pipes.fy3.b.yahoo.com"
    , port: 80
    , path: "/pipes/pipe.run?_id=5a36359b823b6cb19e67fc6739c6a02b&_render=json&location="
    }

function extend ( dest, src ) {
  var prop
  for (prop in src) {
    dest[prop] = src[prop];
  }
  return dest
}

function toC ( F ) {
  return Math.round( ( parseInt( F, 10 ) - 32 ) * ( 5 / 9 ) )
}

function toF ( C ) {
  return Math.round( parseInt( C, 10 ) * ( 9 / 5 ) + 32 )
}

module.exports = function getWeather ( location, holla ) {
  if ( !location )
    holla( "Please provide a location" )

  var opt = extend( {}, pipe_url )
  opt.path += encodeURIComponent( location )

  get( opt, function( resp ) {
    var w, body = ""

    resp.on( 'data', function ( chunk ) {
      body += chunk
    })

    resp.on( 'close', function ( chunk ) {
      holla( "Sorry, no results for: " + location )
    })

    resp.on( 'end', function () {
      try {
        w = JSON.parse( body )

        out = w.value.items[0].channel.item.title
        out += ": "
        out += toC( w.value.items[0].channel.item['yweather:condition'].temp )
        out += "°C / "
        out += w.value.items[0].channel.item['yweather:condition'].temp
        out += "°F "
        out += w.value.items[0].channel.item['yweather:condition'].text

        holla( out )
      }
      catch ( e ) {
        holla( "Sorry, no results for: " + location )
      }
    })
  }).on( "error", function( err ) {
    holla( "Sorry, no results for: " + location )
  })
}

