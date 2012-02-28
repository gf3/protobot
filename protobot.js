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
  , Octo = require( './vendor/octo/octo' )
  , Google = require( './vendor/google/google' )
  , DuckDuckGo = require( './vendor/duckduckgo/duckduckgo' )
  , WolframAlpha = require( './vendor/wolframalpha/wolframalpha' )
  , unescapeAll = require( './vendor/unescape/unescape' )
  , weather = require( './vendor/weather/weather' )
  , bot
  , rclient
  , sandbox
  , google
  , wa
  , options
  , commands
  , dynamic_json
  , c

options = 
  { server:   'irc.freenode.net'
  , nick:     'david_mark'
  , channels: [ '#RubyOnRails', '#runlevel6', '#inimino', '#prototype', '#jquery-ot', '#wadsup' ]
  , user:
    { username: 'david_mark'
    , hostname: 'intertubes'
    , servername: 'tube001'
    , realname: 'Prototype Bot'
    }
  , logdir: 'logs'
  }

// Dynamic JSON reloads
dynamic_json = {}
reloadJSON(
  { wat: 'vendor/WAT/wat.json'
  , crew: 'http://ot-crew.com/crew.json'
  })

// Sandbox
sandbox = new Sandbox()

// Google
google = new Google()

// DuckDuckGo
duckDuckGo = new DuckDuckGo()

// WolframAlpha
wa = new WolframAlpha()

/* ------------------------------ Simple Commands ------------------------------ */
commands =
  { about: "http://github.com/gf3/protobot"
  , accessproperty: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators"
  , anyone: "Has anyone really been far even as decided to use even go want to do look more like?"
  , appendscript: "var script = document.createElement( 'script' ); script.src='...'; document.body.appendChild( script );"
  , asi: "Automatic Semi-colon Insertion. Read: http://inimino.org/~inimino/blog/javascript_semicolons"
  , backtrace: "THE CONSEQUENCES WILL NEVER BE THE SAME"
  , bracketnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Bracket_notation"
  , bubble: "http://www.quirksmode.org/js/events_order.html"
  , casesensitive: "The case-sensitivity of document language element names in selectors depends on the document language. For example, in HTML, element names are case-insensitive, but in XML they are case-sensitive."
  , cc: "CASE CLOASED >:|"
  , cheeseburger: "(|%|)"
  , commands: "http://github.com/gf3/protobot/blob/master/COMMANDS.md"
  , 'debugger': "Debugging JavaScript is easy with the right tools!  Try the Web Inspector for Safari + Chrome http://webkit.org/blog/197/web-inspector-redesign/ or Firebug for Firefox http://getfirebug.com/ or Dragonfly for Opera http://bit.ly/rNzdz"
  , delegation: "Info: http://pxlz.org/tZ Code: http://pxlz.org/ua"
  , dotnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Dot_notation"
  , DRY: "Don't Repeat Yourself"
  , ES3: "ES3 is edition 3 of ECMA-262, the ECMAScript specification: http://www.ecma-international.org/publications/standards/Ecma-262-arch.htm now obsoleted by ES5"
  , ES5: "ES5 is edition 5 of ECMA-262, the ECMAScript ( aka JavaScript ) specification: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf"
  , eventintro: "http://www.quirksmode.org/js/introevents.html"
  , evil: "eval is evil! Don't! Read: http://blogs.msdn.com/b/ericlippert/archive/2003/11/01/53329.aspx and http://blogs.msdn.com/b/ericlippert/archive/2003/11/04/53335.aspx"
  , flip: "(╯‵Д′)╯彡┻━┻"
  , help: "NO U!"
  , heyyy: "(☞ﾟ∀ﾟ)☞"
  , isjc: "☁ It's so just Cloud™ - http://itssojustcloud.com/ - http://groups.google.com/group/jquery-dev/browse_thread/thread/6a39be05b8477401#msg_f90341223bb9b68b ☁"
  , jic: "just in case™"
  , jsis: "javascript is javascript is javascript"
  , 'false': 'falsy values in js: null, undefined, NaN, false, zero ( the number 0 - "0" is true ), "" ( empty string )'
  , fouc: "http://paulirish.com/2009/avoiding-the-fouc-v3/"
  , minimal: "A minimal test case should contain precisely the HTML and JavaScript necessary to demonstrate the problem, no more and no less.  If it is more than 32 lines, it is probably not a minimal test case."
  , mlmlm: "much like multi-level marketing"
  , mlu: "much like urself"
  , ninja: "http://ejohn.org/apps/learn"
  , noob: "http://www.marriedtothesea.com/022310/i-hate-thinking.gif"
  , os: "oh snao™"
  , osb: "oh snao™ bitch"
  , osisjc: "(  oh snao™ is so just cloud™  )™"
  , pastie: "Paste links not code: http://pastie.org/ , http://jsbin.com/ , http://dpaste.de/ , http://gist.github.com/"
  , PHP: "You're asking a JavaScript question but you're showing us PHP instead of HTML and JavaScript. Maybe your PHP code results in well-formed JavaScript code, maybe it doesn't; we don't know. Please show us the HTML JavaScript that the browser sees."
  , pizza: "(>"
  , plugins: "Check out: http://scripteka.com and http://livepipe.net"
  , point: "If you have a question, please just ask it. Do not look for topic experts. Do not ask \"Can I ask a question?\", \"Can anyone help?\", or \"Does anybody use/know about foo?\". Don't make people work to find out what your question is."
  , protoquery: "STOP! Don't do it. Prototype and jQuery do the same things, you don't need both. It just adds twice the overhead and potential for conflicts. Pick one or the other."
  , proto: "http://dhtmlkitchen.com/learn/js/enumeration/prototype-chain.jsp"
  , reinvent: "We will not help you reinvent the wheel if we recommend using the many wheels already available. If you choose to make your own, you're on your own."
  , sop: "Requests must respect the Same Origin Policy ( http://en.wikipedia.org/wiki/Same_origin_policy ). Requesting cross-domain content in javascript is generally prohibited. Seeing OPTIONS requests? See https://developer.mozilla.org/en/HTTP_access_control"
  , spelling: "Spelling and capitalization are important in programming."
  , testcase: "see: minimal"
  , tias: "Try It And See"
  , truthy: "Truthy/Falsy Values & Comparison Operators: http://www.sitepoint.com/blogs/2009/07/01/javascript-truthy-falsy/ Truthy/Falsy Values & Boolean Operator Results: http://11heavens.com/falsy-and-truthy-in-javascript"
  , tyvm: "Thank you SO SO SO much!"
  , uaa: "ur an alligator"
  , validid: 'ID attributes must begin with a letter ( [A-Za-z] ) and may be followed by any number of letters, digits ( [0-9] ), hyphens ( "-" ), underscores ( "_" ), colons ( ":" ), and periods ( "." ). http://www.w3.org/TR/html401/types.html#h-6.2 - furthermore, IDs are unique, meaning only one element in the DOM can have a given ID at any time'
  , vamp: "http://slash7.com/pages/vampires"
  , wattt: "(″･ิ_･ิ)っ"
  , WET: "Write Everything Twice"
  , whyyy: "ლ(ﾟдﾟლ)"
  , zalgo: "H̹̙̦̮͉̩̗̗ͧ̇̏̊̾Eͨ͆͒̆ͮ̃͏̷̮̣̫̤̣ ̵̞̹̻̀̉̓ͬ͑͡ͅCͯ̂͐͏̨̛͔̦̟͈̻O̜͎͍͙͚̬̝̣̽ͮ͐͗̀ͤ̍̀͢M̴̡̲̭͍͇̼̟̯̦̉̒͠Ḛ̛̙̞̪̗ͥͤͩ̾͑̔͐ͅṮ̴̷̷̗̼͍̿̿̓̽͐H̙̙̔̄͜"
  , '( ?:gl|glwtd )': "http://goodluckwiththatdude.com/"
  , '===': "For any primitive values o and p, o === p if o and p have the same value and type.  For any Objects o and p, o === p if mutating o will mutate p in the same way."
  }

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
    message.say( message.user + ': ' + r[ Math.floor( Math.random() * r.length ) ] )
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

  // GitHub User
  j.watch_for( /^([\/.,`?]?)gh(\s+\w+)?\s*$/, function( message ) {
    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    var name = to( message, 2 )
    Octo.user( name, function( err, user ) {
      if ( err )
        message.say( 'Error: ' + err.message )
      else
        message.say( 'GitHub user: ' + user.login + ' (' + user.name + ') Repos: ' + user.public_repos + ' • Following: ' + user.following + ' • Followers: ' + user.followers )
    })
  })

  // Nerd Cred
  j.watch_for( /^([\/.,`?]?)cred(\s+\w+)?\s*$/, function( message ) {
    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    var name = to( message, 2 )
    Octo.score( name, function( err, score ) {
      if ( err )
        message.say( 'Error: ' + err.message )
      else
        message.say( 'GitHub User: ' + name + ' • Score: ' + score )
    })
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
  
  // Google
  j.watch_for( /^([\/.,`?]?)g ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?$/, function( message ) {
    var user = to( message, 4 )
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
  })

  // DuckDuckGo
  j.watch_for( /^([\/.,`?]?)ddg ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?$/, function( message ) {
    var user = to( message, 4 )
      , term = message.match_data[2]
      , num  = +message.match_data[3]-1 || 0

    duckDuckGo.search( term, function( results ) {
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

  // Wolfram Alpha
  j.watch_for( /^([\/.,`?]?)wa ([^@]+)(?:\s*@\s*([-\[\]\{\}`|_\w]+))?/, function( message ) {
    var user = to( message, 3 )

    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    wa.search( message.match_data[2], function( result ) {
      message.say( user + ": " + ( result && result.data ? unescapeAll( result.data ) : "Sorry, no results for '" + message.match_data[2] + "'" ) )
    })
  })

  // Weather
  j.watch_for( /^([\/.,`?]?)(time|weather)(\s+[^@]+)?(?:\s*@\s*([-\[\]\{\}`|_\w]+))?/, function( message ) {
    var user = to( message, 4 )
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

    weather( location, message.match_data[2] == 'time', function( result ) {
      message.say( user + ": " + result )
    })
  })
  
  // MDN, formerly known as MDC
  j.watch_for( /^([\/.,`?]?)(?:mdc|mdn) ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]|_\w]+))?$/, function( message ) {
    var user = to( message, 3 )
      , res  = +message.match_data[2]-1 || 0

    // Return if botty is present
    if ( message.match_data[1] == '?' && message.source.clients.indexOf( 'bot-t' ) >= 0 )
      return

    google.search( message.match_data[2] + ' site:developer.mozilla.org', function( results ) {
      if ( results.length )
        message.say( user + ": " + results[res].titleNoFormatting + " - " + results[res].unescapedUrl )
      else
        message.say( user + ": Sorry, no results for '" + message.match_data[2] + "'" )
    })
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

  // CANIUSE?
  j.watch_for( /^([\/.,`?]?)caniuse ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]|_\w]+))?$/, function ( message ) {
    var user = to( message, 3 )
      , search =  message.match_data[ 2 ].split( ' ' ).join( '+' )
      , use = ''
      , agents = ''
      , links = ''
      
    if( search )
    {
      http
        .get( { host: 'sandbox.thewikies.com', path: '/caniuse/' + search + '.js?noagent&readable', port: 80 }, function ( res ) {
          var data = ''
          res
            .on( 'data', function ( c ) { data += c } )
            .on( 'end', function() {
              
              var j = JSON.parse( data )
              
              if ( j.features.length !== 0 ) {
                
                var f = j.features
                  , r = j.results
                  , a = j.agents
                
                use += Object.keys( f ).map( function( k ) {
                  links += ' http://caniuse.com/#search=' + k
                  return f[ k ]
                }).join( ', ' ).replace( /,([^,]*?)$/, ', and$1' )
                
                agents += Object.keys( r ).map( function( k ) {
                  return j.agents[ k ].name + ' ' + r[ k ]
                }).join( ', ' ).replace( /,([^,]*?)$/, ', and$1' )
                
                if( agents.length ) {
                  message.say( message.user + ': You can use ' + use + ' with ' + agents + '.' + links )
                } else {
                  message.say( message.user + ': ' + use + ' is not fully supported anywhere.' )
                }
              }
            })
        })
    }
  })

}).connect( options )

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

