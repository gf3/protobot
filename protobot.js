/* ------------------------------ Includes && Options ------------------------------ */
process.mixin(GLOBAL, require("./vendor/Jerk/lib/jerk"));
var sys = require("sys"),
    http = require("http");

var options = {
  server:   "irc.freenode.net",
  nick:     "protobot",
  channels: ["#runlevel6", "#prototype"],
  user: {
    username: "protobot",
    hostname: "intertubes",
    servername: "tube001",
    realname: "Prototype Bot"
  }
};

// Sandbox
process.mixin(GLOBAL, require("./vendor/sandbox/lib/sandbox"));
var sandbox = new Sandbox();

// Google
process.mixin(GLOBAL, require("./vendor/google/google"));
var google = new Google();

/* ------------------------------ Simple Commands ------------------------------ */
// Some of these are stolen from: http://github.com/JosephPecoraro/jsircbot/blob/master/commands.yaml
var commands = {
  about: "http://github.com/gf3/protobot",
  help: "NO U!",
  commands: "http://github.com/gf3/protobot/blob/master/COMMANDS.md",
  accessproperty: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators",
  bracketnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Bracket_notation",
  dotnotation: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Operators/Member_Operators#Dot_notation",
  delegation: "Info: http://pxlz.org/tZ Code: http://pxlz.org/ua",
  bubble: "http://www.quirksmode.org/js/events_order.html",
  eventintro: "http://www.quirksmode.org/js/introevents.html",
  ninja: "http://ejohn.org/apps/learn",
  testcase: "see: minimal",
  minimal: "A minimal test case should contain precisely the HTML and JavaScript necessary to demonstrate the problem, no more and no less.  If it is more than 32 lines, it is probably not a minimal test case.",
  'debugger': "Debugging JavaScript is easy with the right tools!  Try the Web Inspector for Safari + Chrome http://webkit.org/blog/197/web-inspector-redesign/ or Firebug for Firefox http://getfirebug.com/ or Dragonfly for Opera http://bit.ly/rNzdz",
  '===': "For any primitive values o and p, o === p if o and p have the same value and type.  For any Objects o and p, o === p if mutating o will mutate p in the same way.",
  vamp: "http://slash7.com/pages/vampires",
  ES3: "ES3 is edition 3 of ECMA-262, the ECMAScript specification: http://www.ecma-international.org/publications/standards/Ecma-262-arch.htm now obsoleted by `ES5",
  ES5: "ES5 is edition 5 of ECMA-262, the ECMAScript (aka JavaScript) specification: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf",
  spelling: "Spelling and capitalization are important in programming.",
  pastie: "Paste links not code: http://pastie.org/ , http://jsbin.com/ , http://dpaste.de/ , http://gist.github.com/",
  protoquery: "STOP! Don't do it. Prototype and jQuery do the same things, you don't need both. It just adds twice the overhead and potential for conflicts. Pick one or the other.",
  proto: "http://dhtmlkitchen.com/learn/js/enumeration/prototype-chain.jsp"
};

for (var c in commands) {
  jerk(function(j) {
    var cmd = commands[c];
    j.watch_for(new RegExp("^" + c + "(?:\\s*@\\s*([-\\[\\]|_\\w]+))?$", "i"), function(message) {
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
  
  j.watch_for(/^help$/i, function(message) {
    message.say(message.user + ": NO U!");
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

