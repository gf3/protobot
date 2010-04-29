/* ------------------------------ Includes && Options ------------------------------ */
var sys = require('sys')
  , jerk = require('./vendor/Jerk/lib/jerk')
  ;

var options = 
  { server:   'irc.freenode.net'
  , nick:     'protobot'
  , channels: ['#runlevel6', '#prototype']
  , user:
    { username: 'protobot'
    , hostname: 'intertubes'
    , servername: 'tube001'
    , realname: 'Prototype Bot'
    }
  };

// Sandbox
var Sandbox =  require("./vendor/sandbox/lib/sandbox")
  , sandbox = new Sandbox();

// Google
var Google = require("./vendor/google/google")
  , google = new Google();

/* ------------------------------ Simple Commands ------------------------------ */
// Some of these are stolen from: http://github.com/JosephPecoraro/jsircbot/blob/master/commands.yaml
var commands = {
  about: "http://github.com/gf3/protobot",
  appendscript: "var script = document.createElement('script'); script.src='...'; document.body.appendChild(script);",
  'false': 'falsy values in js: null, undefined, NaN, false, zero (the number 0 - "0" is true), "" (empty string)',
  truthy: "Truthy/Falsy Values & Comparison Operators: http://www.sitepoint.com/blogs/2009/07/01/javascript-truthy-falsy/ Truthy/Falsy Values & Boolean Operator Results: http://11heavens.com/falsy-and-truthy-in-javascript",
  fouc: "http://paulirish.com/2009/avoiding-the-fouc-v3/",
  '(?:gl|glwtd)': "http://goodluckwiththatdude.com/",
  point: "If you have a question, please just ask it. Do not look for topic experts. Do not ask \"Can I ask a question?\", \"Can anyone help?\", or \"Does anybody use/know about foo?\". Don't make people work to find out what your question is.",
  reinvent: "We will not help you reinvent the wheel if we recommend using the many wheels already available. If you choose to make your own, you're on your own.",
  tias: "Try It And See",
  validid: 'ID attributes must begin with a letter ([A-Za-z]) and may be followed by any number of letters, digits ([0-9]), hyphens ("-"), underscores ("_"), colons (":"), and periods ("."). http://www.w3.org/TR/html401/types.html#h-6.2 - furthermore, IDs are unique, meaning only one element in the DOM can have a given ID at any time',
  PHP: "You're asking a JavaScript question but you're showing us PHP instead of HTML and JavaScript. Maybe your PHP code results in well-formed JavaScript code, maybe it doesn't; we don't know. Please show us the HTML JavaScript that the browser sees.",
  DRY: "Don't Repeat Yourself",
  WET: "Write Everything Twice",
  help: "NO U!",
  casesensitive: "The case-sensitivity of document language element names in selectors depends on the document language. For example, in HTML, element names are case-insensitive, but in XML they are case-sensitive.",
  cheeseburger: "(|%|)",
  commands: "http://github.com/gf3/protobot/blob/master/COMMANDS.md",
  accessproperty: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators",
  bracketnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Bracket_notation",
  dotnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Dot_notation",
  delegation: "Info: http://pxlz.org/tZ Code: http://pxlz.org/ua",
  bubble: "http://www.quirksmode.org/js/events_order.html",
  eventintro: "http://www.quirksmode.org/js/introevents.html",
  ninja: "http://ejohn.org/apps/learn",
  sop: "Requests must respect the Same Origin Policy (http://en.wikipedia.org/wiki/Same_origin_policy). Requesting cross-domain content in javascript is generally prohibited. Seeing OPTIONS requests? See https://developer.mozilla.org/en/HTTP_access_control",
  testcase: "see: minimal",
  minimal: "A minimal test case should contain precisely the HTML and JavaScript necessary to demonstrate the problem, no more and no less.  If it is more than 32 lines, it is probably not a minimal test case.",
  'debugger': "Debugging JavaScript is easy with the right tools!  Try the Web Inspector for Safari + Chrome http://webkit.org/blog/197/web-inspector-redesign/ or Firebug for Firefox http://getfirebug.com/ or Dragonfly for Opera http://bit.ly/rNzdz",
  '===': "For any primitive values o and p, o === p if o and p have the same value and type.  For any Objects o and p, o === p if mutating o will mutate p in the same way.",
  vamp: "http://slash7.com/pages/vampires",
  ES3: "ES3 is edition 3 of ECMA-262, the ECMAScript specification: http://www.ecma-international.org/publications/standards/Ecma-262-arch.htm now obsoleted by `ES5",
  ES5: "ES5 is edition 5 of ECMA-262, the ECMAScript (aka JavaScript) specification: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf",
  spelling: "Spelling and capitalization are important in programming.",
  pastie: "Paste links not code: http://pastie.org/ , http://jsbin.com/ , http://dpaste.de/ , http://gist.github.com/",
  plugins: "Check out: http://scripteka.com and http://livepipe.net",
  protoquery: "STOP! Don't do it. Prototype and jQuery do the same things, you don't need both. It just adds twice the overhead and potential for conflicts. Pick one or the other.",
  proto: "http://dhtmlkitchen.com/learn/js/enumeration/prototype-chain.jsp"
};

for (var c in commands) {
  jerk(function(j) {
    var cmd = commands[c];
    j.watch_for(new RegExp("^" + c + "(?:\\s*@\\s*([-\\[\\]|_\\w]+))?\\s*$", "i"), function(message) {
      var to = !!message.match_data[1] ? message.match_data[1] : message.user;
      message.say(to + ": " + cmd);
    });
  });
}

/* ------------------------------ Protobot ------------------------------ */
jerk(function(j) {
  j.watch_for("debug", function(message) {
    message.say(lolwat());
  });
  
  j.watch_for(/^(?:hi|hello)$/i, function(message) {
    message.say(message.user + ": oh hai!");
  });
  
  j.watch_for(/^eval (.+)/, function(message){
    sandbox.run(message.match_data[1], function(output) {
      message.say(message.user + ": " + output);
    })
  });
  
  j.watch_for(/^(?:it )?doesn(?:')?t work(?:\s*@\s*([-\[\]|_\w]+))?/, function(message) {
    var to = !!message.match_data[1] ? message.match_data[1] : "doesn't work";

    message.say(to + ": What do you mean it doesn't work?  What happens when you try to run it?  What's the output?  What's the error message?  Saying \"it doesn't work\" is pointless.")
  });
  
  j.watch_for(/^g(?:oogle)? ([^@]+)(?:\s*@\s*([-\[\]|_\w]+))?/, function(message) {
    var to = !!message.match_data[2] ? message.match_data[2] : message.user;

    google.search(message.match_data[1], function(results) {
      if (results.length) message.say(to + ": " + results[0].titleNoFormatting + " - " + results[0].unescapedUrl);
      else message.say(to + ": Sorry, no results for '" + message.match_data[1] + "'");
    });
  });
  
  j.watch_for(/^mdc ([^@]+)(?:\s*@\s*([-\[\]|_\w]+))?/, function(message) {
    var to = !!message.match_data[2] ? message.match_data[2] : message.user;

    google.search(message.match_data[1] + ' site:developer.mozilla.org', function(results) {
      if (results.length) message.say(to + ": " + results[0].titleNoFormatting + " - " + results[0].unescapedUrl);
      else message.say(to + ": Sorry, no results for '" + message.match_data[1] + "'");
    });
  });
  
  j.watch_for(/^api ([$\w]+(?:[\.#]\w+)*)(?:\s+@\s*([-\[\]|_\w]+))?/, function(message) {
    var to = !!message.match_data[2] ? message.match_data[2] : message.user,
        url;
    
    if (url = api(message.match_data[1])) message.say(to + ": " + url);
    else message.say(to + ": Sorry, no docs for '" + message.match_data[1] + "'");
  });
}).connect(options);

/* ------------------------------ Functions ------------------------------ */
function lolwat() {
  return "LOLWAT";
}

function api(input) {
  input = input.toLowerCase();
  var method_type,
      sep,
      splitForDocs = function(str, token) {
        var pos;
        if (typeof token === "undefined" || (pos = str.lastIndexOf(token)) < 0) return [str];
        else return [str.substring(0, pos).split(".").join("/"), str.substr(pos+1)];
      },
      base_url = 'http://api.prototypejs.org/',
      shortcuts = {
        '$':  'dom/dollar',
        '$$': 'dom/dollardollar',
        '$f': 'dom/dollarf',
        '$a': 'language/dollara',
        '$h': 'language/dollarh',
        '$r': 'language/dollarr',
        '$w': 'language/dollarw',
        'document.viewport': 'dom/document/viewport',
        'ajax.periodicalupdater': 'ajax/ajax/periodicalupdater',
        'ajax.request': 'ajax/ajax/request',
        'ajax.responders': 'ajax/ajax/responders',
        'ajax.updater': 'ajax/ajax/updater',
        'form.element': 'dom/form/element',
        'form.element.observer': 'dom/form/element/observer'
      },
      sections  = {
        'ajax': [
          'ajax',
          'ajax/periodicalupdater',
          'ajax/request',
          'ajax/responders',
          'ajax/updater'
        ],
        'dom': [
          'dollar',
          'dollardollar',
          'dollarf',
          'abstract',
          'element',
          'event',
          'form',
          'form/element',
          'form/element/observer',
          'selector',
          'document',
          'document/viewport'
        ],
        'language': [
          'dollara',
          'dollarh',
          'dollarr',
          'dollarw',
          'array',
          'class',
          'enumerable',
          'function',
          'hash',
          'number',
          'object',
          'objectrange',
          'periodicalexecutor',
          'regexp',
          'string',
          'template',
          'try'
        ]
      },
      parts = (sep = (input.split("").reverse().join("").match(/([#\.])/) || [])[1] || true) && (method_type = (sep == '#' ? 'instance_method' : 'class_method')) && splitForDocs(input, sep);
    
    // Shortcut
    if (input in shortcuts) return(base_url + shortcuts[input] + '.html');
    // Full
    for (var section in sections)
      for (var i = 0; i < sections[section].length; i++)
        if (parts[0] == sections[section][i])
          return(base_url + section + '/' + parts[0] + '.html' + (parts.length == 2 ? '#' + parts[1] + '-' + method_type : ''));
}

