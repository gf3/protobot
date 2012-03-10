/* ------------------------------ Includes && Options ------------------------------ */
var exec = require( 'child_process' ).exec
  , unescapeAll = require( '../vendor/unescape/unescape' )

/* ------------------------------ Google ------------------------------ */
function Google() {
  this.search = function( query, hollaback ) {
    exec("curl -e 'http://gf3.ca/' 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=" + escape( query ) + "'", function ( err, stdout, stderr ) {
      var results = JSON.parse( stdout )[ 'responseData' ][ 'results' ]
      hollaback.call( this, results )
    })
  }
}

function register( j ) {
  var google = new Google

  j.watch_for( /^([\/.,`?]?)g(?:[ogle]{0,5}) ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?$/, function( message ) {
    try {
    var user = message.match_data[4] || message.user
      , res  = +message.match_data[3]-1 || 0

    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    google.search( message.match_data[2], function( results ) {
      if ( results.length )
        message.say( user + ': ' + unescapeAll( results[res].titleNoFormatting ) + ' - ' + results[res].unescapedUrl )
      else
        message.say( user + ": Sorry, no results for '" + message.match_data[2] + "'" )
    })
    } catch (e) { console.info(e) }
  })
}

/* ------------------------------ Export ------------------------------ */
exports.register = register
