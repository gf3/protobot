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

function getWeather ( location, justTime, holla ) {
  if ( !location )
    holla( "Please provide a location" )

  var opt = extend( {}, pipe_url )
  opt.path += encodeURIComponent( location )

  get( opt, function( resp ) {
    var w, out, body = ""

    resp.on( 'data', function ( chunk ) {
      body += chunk
    })

    resp.on( 'close', function ( chunk ) {
      holla( "Sorry, no results for: " + location )
    })

    resp.on( 'end', function () {
      try {
        w = JSON.parse( body )

        if ( justTime ) {
          out = w.value.items[0].channel.item['yweather:condition'].date
        }
        else {
          out = w.value.items[0].channel.item.title
          out += ": "
          out += toC( w.value.items[0].channel.item['yweather:condition'].temp )
          out += "°C / "
          out += w.value.items[0].channel.item['yweather:condition'].temp
          out += "°F "
          out += w.value.items[0].channel.item['yweather:condition'].text
        }

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

exports.register = function( j, dynamic_json ) {
  j.watch_for( /^([\/.,`?]?)(time|weather)(\s+[^@]+)?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?/, function( message ) {
    var user = message.match_data[4] || message.user
      , location = message.match_data[3]
      , person

    if ( location )
      location = location.trim()

    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    // Try and find by person first
    person = dynamic_json.crew.filter( function( v, i, a ) { return v.irc == location } )
    if ( person.length )
      location = person[0].location
    else if ( !person.length )
      person = dynamic_json.crew.filter( function( v, i, a ) { return v.irc == user } )

    if ( location == undefined && person.length )
      location = person[0].location

    getWeather( location, message.match_data[2] == 'time', function( result ) {
      message.say( user + ": " + result )
    })
  })
}