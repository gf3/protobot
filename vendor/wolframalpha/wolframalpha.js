/* ------------------------------ Includes && Options ----------------- */
var exec = require( 'child_process' ).exec

/* ------------------------------ WolframAlpha ------------------------ */
function WolframAlpha() {
    this.search = function( query, hollaback ) {
    var result =
      { url: 'http://www.wolframalpha.com/input/?i=' + encodeURIComponent( query )
      }

      exec( "curl -e 'http://www.wolframalpha.com' '" + result.url + "'", function ( err, stdout, stderr ) {
        var solution = />Solution:<[\s\S]*?alt\s*=\s*\"([^\""]*)\"/
          , other = /stringified"\s*:\s*"([^"\r\n]*)/g

        if ( solution.test( stdout ) )
          result.data = stdout
            .match( solution )[1]
            .replace( /\\\//, '/' )
        else {
          match = stdout.match( other )
          if ( !match || !match[1] )
            result.data = null
          else
            result.data = match[1]
              .replace( /stringified"\s*:\s*"/g, '' )
              .replace( /\\n/g, ' ' )
              .replace( /\\\//, '/' )
        }

        hollaback.call( this, result )
    })
  }
}

/* ------------------------------ Export ------------------------------ */
module.exports = WolframAlpha;

