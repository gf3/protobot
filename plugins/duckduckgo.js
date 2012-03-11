exports.register = register

var exec = require( 'child_process' ).exec

/* ---------------------------- DuckDuckGo ---------------------------- */
function DuckDuckGo() {
}

DuckDuckGo.prototype.search = function( query, cloudback ) {
  exec("curl 'http://api.duckduckgo.com/?format=json&q=" + escape( query ) + "'", function ( err, stdout, stderr ) {
    var results = JSON.parse( stdout ) // What could possibly go wrong?
    cloudback.call( this, results )
  })
}

function register( j ) {
  var ddg = new DuckDuckGo()

  j.watch_for( /^([\/.,`?]?)ddg ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?$/, function( message ) {
    var user = message.match_data[4] || message.name
      , term = message.match_data[2]
      , num  = +message.match_data[3]-1 || 0

    ddg.search( term, function( results ) {
      if ( results["AbstractText"] )
        message.say( user + ': ' + unescapeAll( results["AbstractText"] ) + ' - ' + results["AbstractURL"] )
      else if ( results["Definition"] )
        message.say( user + ': ' + results["Definition"] + ' - ' + results["DefinitionURL"] )
      else if ( results["Redirect"] ) // !bang syntax used
        message.say( user + ': ' + results["Redirect"] )
      else if ( results["Results"].length )
        message.say( user + ': ' + results["Results"][num]["Text"] + " - " + results["Results"][num]["FirstURL"] )
      else
        message.say( user + ": Sorry, no results for '" + term + "'" )
    })
  })
}
