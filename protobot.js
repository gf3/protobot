/* ------------------------------ Includes && Options ------------------------------ */
require( './vendor/strftime/strftime' )

var util = require( 'util' )
  , fs = require( 'fs' )
  , path = require( 'path' )
  , http = require( 'http' )
  , URL = require( 'url' )
  , exec  = require( 'child_process' ).exec
  , spawn = require( 'child_process' ).spawn
  , redis = require( 'redis' )
  , groupie = require('groupie')
  , jerk = require( 'jerk' )
  , Sandbox =  require( 'sandbox' )
  , unescapeAll = require( './vendor/unescape/unescape' )
  , settingsFile = path.join( __dirname, "settings.json" )
  , commandsFile = path.join( __dirname, "commands.json" )
  , bot
  , rclient
  , sandbox
  , options
  , commands
  , dynamic_json
  , c

options = JSON.parse( fs.readFileSync( process.argv[2] || settingsFile ) );

// Dynamic JSON reloads
dynamic_json = {}
reloadJSON(
  { wat: 'vendor/WAT/wat.json'
  , crew: 'http://ot-crew.com/crew.json'
  })

// Sandbox
sandbox = new Sandbox()

/* ------------------------------ Simple Commands ------------------------------ */
commands = JSON.parse( fs.readFileSync( commandsFile ) );

for ( c in commands )
  watchForSingle( c, commands[c] )

// Redis
rclient = redis.createClient( 9307, 'stingfish.redistogo.com' )
rclient.auth( 'da834e6f78e4ea8c4c25ac20f0c8869a' )
rclient.on( 'error', function ( err ) {
  console.log( 'Redis error: ' + err )
})
rclient.hgetall( 'triggers', function ( err, obj ) {
  var i
  console.log( err, obj )
  if ( ! err )
    for ( i in obj )
      watchForSingle( i, obj[i] )
})

/* ------------------------------ Protobot ------------------------------ */
bot = jerk( function( j ) {
  // Wat?
  j.watch_for( /\b(w[au]t)\b/, function( message ) {
    switch ( String( message.source ) ) {
      case '#jquery-ot':
      case '#runlevel6':
        message.say( dynamic_json.wat[ Math.floor( Math.random() * dynamic_json.wat.length ) ] )
        break
    }
  })
  
  // Noobs
  j.watch_for( RegExp("^(?:" + options.nick + "\\W+)?(?:hi|hello|hey)(?:\\W+" + options.nick + ".*)?$", "i"), function( message ) {
    var r = [ 'oh hai!', 'why hello there', 'hey', 'hi', 'sup?', 'hola', 'yo!' ]
    setTimeout( function() {
      message.say( message.user + ': ' + r[ Math.floor( Math.random() * r.length ) ] )
    }, Math.round( Math.random() * 10000 ))
  })

  // Boom!
  j.watch_for( /^Boom!$/i, function( message ) {
    message.say( 'Did you are unimpressed? and now?' )
  })

  // NO NO U
  j.watch_for( /^((?:NO )+)U$/, function( message ) {
    message.say( message.user + ': ' + message.match_data[1] + 'NO U' )
  })

  // Y U <something>
  j.watch_for( /\by u\b/i, function( message ) {
    message.say( "(屮'Д')屮" )
  })

  // Shrug
  j.watch_for( /\bshrugs\b/i, function( message ) {
    message.say( "¯\\_(ツ)_/¯" )
  })

  // Alligator
  j.watch_for( /\balligator\b/i, function( message ) {
    message.say( "---,==,'<" )
  })

  // Live reload
  j.watch_for( /^[\/.,`?]?reload (\w+)$/, function( message ) {
    liveReload( message )
  })

  // Redis
  j.watch_for( /^(?:david_mark|protobot|bot\-t)[,:]? ([-_.:|\/\\\w]+) is[,:]? (.+)$/, function( message ) {
    rclient.hmset( 'triggers', message.match_data[1], message.match_data[2], function( err ) {
      if ( err )
        message.say( message.user + ': Oops, there was an error: ' + err )
      else {
        message.say( message.user + ': kk' )
        watchForSingle( message.match_data[1], message.match_data[2] )
      }
    })
  })

  j.watch_for( /^(?:david_mark|protobot|bot\-t)[,:]? forget[,:]? (.+)$/, function( message ) {
    rclient.hdel( 'triggers', message.match_data[1], function( err ) {
      if ( err )
        message.say( message.user + ': Oops, there was an error: ' + err )
      else {
        message.say( message.user + ': kk' )
        bot.forget( new RegExp( "^[\\/.`?]?" + message.match_data[1] + "(?:\\s*@\\s*([-\\[\\]\\{\\}`|_\\w]+))?\\s*$", "i" ) )
      }
    })
  })

  // Finger
  j.watch_for( /^([\/.,`?]?)f(?:inger)?(\s+[-\[\]\{\}`|_\w]+)?\s*$/, function( message ) {
    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    var name = to( message, 2 )
      , user = dynamic_json.crew.filter( function( v, i, a ) { return v.irc == name } )
    if ( user.length )
      message.say( '-ot crew • ' + util.inspect( user[0] ).replace( /\n/g, '' ) )
    else
      message.say( 'Error: User not found.' )
  })

  // Sandbox
  j.watch_for( /^([\/.,`?]?)eval (?:(.+?)(?:\/\/\s*@\s*([-\[\]\{\}`|_\w]+))|(.+))/, function( message ){
    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    var js = message.match_data[2] || message.match_data[4]
    sandbox.run( js, function( output ) { var original_length
      output = output.result.replace( /\n/g, ' ' )
      if ( ( original_length = output.length ) > ( 1024 - message.user.length - 3 ) )
        output = output.slice( 0, 768 ) + '  (' + ( original_length - 768 ) + ' characters truncated)'
      message.say( to( message, 3 ) + ': ' + output )
    })
  })

  // Racket Sandbox
  j.watch_for( /^rkt[→>] (.*)/, function ( message ) {
    var stdout = ''
      , stderr = ''
      , child = spawn( 'racket', [ 'sandboxed-ipc-repl.rkt' ] )
      , stdoutput = function( data ) {
          if ( !!data )
            stdout += data
        }
      , stderrput = function( data ) {
          if ( !!data )
            stderr += data
        }

    child.stdout.on( 'data', stdoutput )
    child.stderr.on( 'data', stderrput )
    child.on( 'exit', function( code ) { var out
      if ( code )
        out = stderr.split( '\n' )[0].replace( 'UNKNOWN::0: read', 'Error' )
      else
        out = stdout
      message.say( message.user + ': ' + out )
    })
    child.stdin.write( message.match_data[1] )
    child.stdin.end()    
  })

  // Clojure Sandbox
  j.watch_for( /^clj[→>] (.*)/, function ( message ) {
    var stdout = ''
      , stderr = ''
      , child = spawn( 'java', [ '-jar', 'srepl-1.0.0-SNAPSHOT-standalone.jar' ] )
      , stdoutput = function( data ) {
          if ( !!data )
            stdout += data
        }
      , stderrput = function( data ) {
          if ( !!data )
            stderr += data
        }

    child.stdout.on( 'data', stdoutput )
    child.stderr.on( 'data', stderrput )
    child.on( 'exit', function( code ) { var out
      if ( code )
        out = stderr
      else
        out = stdout
      message.say( message.user + ': ' + out )
    })
    child.stdin.write( message.match_data[1] )
    child.stdin.end()    
  })

  // "it doesn't work"
  j.watch_for( /^(?:it )?doesn(?:')?t work(?:\s*@\s*([-\[\]\{\}`|_\w]+))?/, function( message ) {
    message.say( to( message, "doesn't work" ) + ": What do you mean it doesn't work?  What happens when you try to run it?  What's the output?  What's the error message?  Saying \"it doesn't work\" is pointless." )
  })

  // Prototype API
  j.watch_for( /^api ([$\w]+(?:[\.#]\w+)*)(?:\s+@\s*([-\[\]|_\w]+))?/, function( message ) {
    message.say( to( message, 2 ) + ": Sorry, the `api` command is temporarily disabled. Docs here: http://api.prototypejs.org/" )
  })

  // LOGS
  j.watch_for( /.*/, function ( message ) {
    var now = new Date()
      , location = path.join( options.logdir, message.source )
      , file = path.join( location, now.strftime( '%Y-%m-%d.log' ) )
      
    // Make the directory
    path.exists( location, function( exists ) {
      var log
      if ( ! exists )
        fs.mkdirSync( location, 0755 )
      log = fs.createWriteStream( file, { flags: 'a' })
      log.write( message + '\n' )
      log.end()
    })
  })
}).connect( options )

// Register plugins
if ( options["plugins"] )
  options["plugins"].forEach( function( plugin ) {
    var plugReg = require( "./plugins/" + plugin ).register
    try {
      jerk( function( j ) {
        // Gross hack until global var is dead
        plugReg( j, dynamic_json )
      })
    } catch (e) {
      console.error( "Failed to register plugin %s: %s", plugin, e )
    }
  })

/* ------------------------------ Functions ------------------------------ */
function to ( message, def, idx ) {
  if ( idx === undefined && typeof def === 'number' )
    idx = def, def = null
  else
    idx = idx || 1
  return !!message.match_data[idx] ? message.match_data[idx].trim() : def || message.user
}

function watchForSingle ( trigger, msg ) {
  jerk( function( j ) {
    j.watch_for( new RegExp( "^([\\/.,`?])?" + trigger + "(?:\\s*@\\s*([-\\[\\]\\{\\}`|_\\w]+))?\\s*$", "i" ), function( message ) {
      // Return if botty is present
      if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
        return

      message.say( to( message, 2 ) + ": " + msg )
    })
  })
}
function reloadJSON ( what, hollaback ) {
  hollaback = hollaback || function(){}

  Object.keys( what ).forEach( function( k ) {
    var url
    if ( what[k].slice( 0, 4 ) == 'http' ) {
      url = URL.parse( what[k] )
      http
        .get( { host: url.host, path: url.pathname + ( url.search || '' ), port: 80 }, function ( res ) {
          var data = ''
          res
            .on( 'data', function ( c ) { data += c } )
            .on( 'end', function(){
              var j = JSON.parse( data )
              hollaback.call( null, undefined, dynamic_json[k] = j )
            })
        })
        .on( 'error', hollaback )
    }
    else
      fs.readFile( what[k], function( er, data ) {
        if ( ! er )
          dynamic_json[k] = JSON.parse( data )
        if ( hollaback )
          hollaback.call( null, er, dynamic_json[k] )
      })
  })
}

function liveReload( message ) { var chain
  switch ( message.match_data[1] ) {
    case 'wat':
      chain =
        [ function( done ) { exec( 'git pull origin master', { cwd: path.join( __dirname, 'vendor', 'WAT' ) }, done ) }
        , function( done ) { reloadJSON( { wat: 'vendor/WAT/wat.json' }, done) }
        , function( done ) { message.say( message.user + ': Last WAT: ' + dynamic_json.wat[ dynamic_json.wat.length - 1 ] ); done() }
        ]
      break
    case 'crew':
      chain =
        [ function( done ) { reloadJSON( { crew: 'http://ot-crew.com/crew.json' }, done) }
        ]
      break
    case 'self': // Assumes it will be automagically restarted by forever/god/monit/whatever
      chain =
        [ function( done ) { exec( 'git pull origin master',  { cwd: __dirname }, done ) }
        , function( done ) { exec( 'git submodule init',      { cwd: __dirname }, done ) }
        , function( done ) { exec( 'git submodule update',    { cwd: __dirname }, done ) }
        , function( done ) { exec( 'git pull origin master',  { cwd: path.join( __dirname, 'vendor', 'WAT' ) }, done ) } // Always use latest WAT
        , function( done ) { process.exit( 0 ) }
        ]
      break
  }

  if ( chain )
    groupie.chain( chain, function ( er, results ) {
      if ( er ) {
        message.say( message.user + ': Sorry there was an error reloading "' + message.match_data[1] + '"' )
        message.say( message.user + ': ' + er.message )
      }
      else
        message.say( message.user + ': Successfully reloaded "' + message.match_data[1] + '"' )
    })
}

