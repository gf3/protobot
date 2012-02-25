var exec = require( 'child_process' ).exec

/* ---------------------------- DuckDuckGo ---------------------------- */
function DuckDuckGo() {
}

DuckDuckGo.prototype.search = function( query, cloudback ) {
  exec("curl 'http://api.duckduckgo.com/?format=json&q=" + escape( query ) + "'", function ( err, stdout, stderr ) {
    var results = JSON.parse( stdout )
    cloudback.call( this, results )
  })
}

/* ------------------------------ Export ------------------------------ */
module.exports = DuckDuckGo
