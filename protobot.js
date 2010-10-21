/* ------------------------------ Includes && Options ------------------------------ */
var sys = require( 'sys' )
  , jerk = require( './vendor/Jerk/lib/jerk' )
  , Sandbox =  require( './vendor/sandbox/lib/sandbox' )
  , Google = require( './vendor/google/google' )
  , WolframAlpha = require( './vendor/wolframalpha/wolframalpha' )
  , sandbox
  , google
  , wa
  , options
  , commands
  , wat
  , c

options = 
  { server:   'irc.freenode.net'
  , nick:     'david_mark'
  , channels: ['#runlevel6', '#prototype', '#jquery-ot']
  , user:
    { username: 'david_mark'
    , hostname: 'intertubes'
    , servername: 'tube001'
    , realname: 'Prototype Bot'
    }
  }

// Sandbox
sandbox = new Sandbox()

// Google
google = new Google()

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
  , help: "NO U!"
  , isjc: "☁ It's so just Cloud™ - http://itssojustcloud.com/ - http://groups.google.com/group/jquery-dev/browse_thread/thread/6a39be05b8477401#msg_f90341223bb9b68b ☁"
  , jic: "just in case™"
  , jsis: "javascript is javascript is javascript"
  , 'false': 'falsy values in js: null, undefined, NaN, false, zero ( the number 0 - "0" is true ), "" ( empty string )'
  , fouc: "http://paulirish.com/2009/avoiding-the-fouc-v3/"
  , minimal: "A minimal test case should contain precisely the HTML and JavaScript necessary to demonstrate the problem, no more and no less.  If it is more than 32 lines, it is probably not a minimal test case."
  , ninja: "http://ejohn.org/apps/learn"
  , noob: "http://www.marriedtothesea.com/022310/i-hate-thinking.gif"
  , os: "oh snao™"
  , osb: "oh snao™ bitch"
  , osisjc: "(  oh snao™ is so just cloud™  )™"
  , pastie: "Paste links not code: http://pastie.org/ , http://jsbin.com/ , http://dpaste.de/ , http://gist.github.com/"
  , PHP: "You're asking a JavaScript question but you're showing us PHP instead of HTML and JavaScript. Maybe your PHP code results in well-formed JavaScript code, maybe it doesn't; we don't know. Please show us the HTML JavaScript that the browser sees."
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
  , validid: 'ID attributes must begin with a letter ( [A-Za-z] ) and may be followed by any number of letters, digits ( [0-9] ), hyphens ( "-" ), underscores ( "_" ), colons ( ":" ), and periods ( "." ). http://www.w3.org/TR/html401/types.html#h-6.2 - furthermore, IDs are unique, meaning only one element in the DOM can have a given ID at any time'
  , vamp: "http://slash7.com/pages/vampires"
  , WET: "Write Everything Twice"
  , '( ?:gl|glwtd )': "http://goodluckwiththatdude.com/"
  , '===': "For any primitive values o and p, o === p if o and p have the same value and type.  For any Objects o and p, o === p if mutating o will mutate p in the same way."
  }

wat =
  [ 'Did you see revolution\'s pad? not yet? it will be a revolution system'
  , 'Boom! Did you are unimpressed? and now?'
  , 'To can create a great boom, Nintendo needs to create a poor boom to can counterattack again and impress all their nintendo fans.'
  , 'Unlike all you, I\'m waiting to see the great boom! The mistery will be revealed and it is on the Revolution\'s controller pad.'
  , 'Has anyone really been far even as decided to use even go want to do look more like?'
  , 'We automated a site recently and several jquery\'s came to using a core engine of jquery 1.3.2'
  , 'What does the core engine do?  Should one core be OK for all jquery\'s? '
  , 'When I tried to use one base core, but the functionality didn\'t work.  So far I haven\'t had a problem.'
  , 'My site is completely unavailable because of you! You bitch!'
  , 'What is this, I don\'t even...'
  , 'If I choose lots of files tactics, then I become to have directory traversal security problem?'
  , 'Given the climate of the current JS developer community I believe jQuery to be the best fit given the climate of the industry.'
  , 'Using jQuery with XY&Z helps to facilitate learning as the problems are already divided and isolated.'
  , 'jQuery in my opinion meets the masses where the masses are.'
  , 'Do I wish everyone understood the tools that dojo provides.'
  , 'What they are looking for a technology or wa Selbs treniren Nich is difficult, but time and wünche, each brings him purely what they are looking for.'
  , 'Although div does not work in many older web browsers, it works in recent versions of popular web browsers'
  , 'If i use jquery in noconflict plugin will work fine as $?'
  , 'Even before this, you are actually going to use that anyone would want to make more?'
  , 'How can i use this to select from which element the function was called?'
  , 'we can meetup at a cigarbar and smoke a couple fat cubans unless your not into that'
  , 'The new icon changes your desktop look really professional!'
  , 'Because in "normal" js is only getElementById which even not working well no normal getElementByClass'
  , 'For some reason this doesn\'t sign in when I barely start using it and when i try to go to it and it isn\'t signed it, I can\'t sign in on that page.'
  , 'can i use document.write to call a json'
  , 'once you understand it will be a red head to wash with dirty waters.. no problem enjoy'
  , 'life is hard...  be alive is funny... sufferin for other happyness is a non sense'
  ]

for ( c in commands ) {
  jerk( function( j ) {
    var cmd = commands[c]
    j.watch_for( new RegExp( "^" + c + "(?:\\s*@\\s*( [-\\[\\]|_\\w]+))?\\s*$", "i" ), function( message ) {
      message.say( to( message ) + ": " + cmd )
    })
  })
}

/* ------------------------------ Protobot ------------------------------ */
jerk( function( j ) {
  j.watch_for( 'debug', function( message ) {
    message.say( lolwat() )
  })

  j.watch_for( /\b(w[au]t)\b/, function( message ) {
    message.say( wat[Math.floor( Math.random(  ) * wat.length )] )
  })
  
  j.watch_for( /^(?:hi|hello|hey)$/i, function( message ) {
    message.say( message.user + ": oh hai!" )
  })

  j.watch_for( /^((?:NO )+)U$/, function( message ) {
    message.say( message.user + ": " + message.match_data[1] + "NO U" )
  })
  
  j.watch_for( /^eval (.+)/, function( message ){
    sandbox.run( message.match_data[1], function( output ) { var original_length
      output = output.replace( /\n/g, ' ' )
      if ( ( original_length = output.length ) > ( 1024 - message.user.length - 3 ) )
        output = output.slice( 0, 768 ) + '  (' + ( original_length - 768 ) + ' characters truncated)'
      message.say( message.user + ": " + output )
    })
  })
  
  j.watch_for( /^(?:it )?doesn(?:')?t work(?:\s*@\s*([-\[\]|_\w]+))?/, function( message ) {
    message.say( to( message, "doesn't work" ) + ": What do you mean it doesn't work?  What happens when you try to run it?  What's the output?  What's the error message?  Saying \"it doesn't work\" is pointless." )
  })
  
  j.watch_for( /^g ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]|_\w]+))?$/, function( message ) {
    var user = to( message, 3 )
      , res  = +message.match_data[2]-1 || 0
    google.search( message.match_data[1], function( results ) {
      if ( results.length )
        message.say( user + ": " + results[res].titleNoFormatting + " - " + results[res].unescapedUrl )
      else 
        message.say( user + ": Sorry, no results for '" + message.match_data[1] + "'" )
    })
  })

  j.watch_for( /^wa ([^@]+)(?:\s+@\s*([-\[\]|_\w]+))?/, function( message ) {
    var user = to( message, 2 )
    wa.search( message.match_data[1], function( result ) {
      message.say( user + ": " + ( result ? result.data : "Sorry, no results for '" + message.match_data[1] + "'" ) )
    })
  })
  
  j.watch_for( /^mdc ([^#@]+)(?:\s*#([1-9]))?(?:\s*@\s*([-\[\]|_\w]+))?$/, function( message ) {
    var user = to( message, 3 )
      , res  = +message.match_data[2]-1 || 0
    google.search( message.match_data[1] + ' site:developer.mozilla.org', function( results ) {
      if ( results.length )
        message.say( user + ": " + results[res].titleNoFormatting + " - " + results[res].unescapedUrl )
      else
        message.say( user + ": Sorry, no results for '" + message.match_data[1] + "'" )
    })
  })
  
  j.watch_for( /^api ([$\w]+(?:[\.#]\w+)*)(?:\s+@\s*([-\[\]|_\w]+))?/, function( message ) {
    message.say( to( message, 2 ) + ": Sorry, the `api` command is temporarily disabled. Docs here: http://api.prototypejs.org/" )
  })
}).connect( options )

/* ------------------------------ Functions ------------------------------ */
function lolwat () {
  return "LOLWAT"
}

function to ( message, def, idx ) {
  if ( typeof idx === 'undefined' && typeof def === 'number' )
    idx = def, def = null
  else
    idx = idx || 1
  return !!message.match_data[idx] ? message.match_data[idx] : def || message.user
}

