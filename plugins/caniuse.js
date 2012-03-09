var http = require( 'http' )

exports.register = register

function register( j ) {
  j.watch_for( /^([\/.,`?]?)caniuse ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]|_\w]+))?$/, canIUse )
}

function canIUse ( message ) {
  var search = message.match_data[ 2 ].split( ' ' ).join( '+' )
      
  if( !search )
    return

  http
    .get( { host: 'api.html5please.com', path: '/' + search + '.json?noagent', port: 80 }, function ( res ) {
      var data = ''
      res
        .on( 'data', function ( c ) { data += c } )
        .on( 'end', function() {
              
          var j = JSON.parse( data )
              
          if ( j.supported != 'unknown' && j.features.length === 0 )
            return
            
          var f = j.features
            , r = j.results
            , a = j.agents

            , use = ''
            , agents = ''
            , links = ''

          use += Object.keys( f ).map( function( k ) {
            links += ' http://caniuse.com/#search=' + k
            return f[ k ]
          }).join( ', ' ).replace( /,([^,]*?)$/, ', and$1' )

          agents += Object.keys( r ).map( function( k ) {
            return j.agents[ k ].name + ' ' + r[ k ]
          }).join( ', ' ).replace( /,([^,]*?)$/, ', and$1' )

          if( agents.length )
            message.say( message.user + ': You can use ' + use + ' with ' + agents + '.' + links )
          else
            message.say( message.user + ': ' + use + ' is not fully supported anywhere.' )
    })
  })
}
