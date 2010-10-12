/* ------------------------------ Includes && Options ----------------- */
var exec = require('child_process').exec;

/* ------------------------------ WolframAlpha ------------------------ */
function WolframAlpha() {
    this.search = function(query, hollaback) {
        exec("curl -e 'http://www.wolframalpha.com' 'http://www.wolframalpha.com/input/?i=" + encodeURIComponent(query) + "'", function (err, stdout, stderr) {
            var result,
                solution = />Solution:<[\s\S]*?alt\s*=\s*\"([^\""]*)\"/,
                other = /stringified"\s*:\s*"([^"\r\n]*)/g;

            if (solution.test(stdout)) {
                result = stdout.match(solution)[1];
            } else {
                result = stdout.match(other);
                if (!result) {
                    result = null;
                } else {
                    result = result[1];
                    result = result.replace(/stringified"\s*:\s*"/g, '');
                    // result = result.replace(/\s*\|\s.*/, '');
                    result = result.replace(/\\n/g, ' ');
                }
            }

            hollaback.call(this, result);
        });
    };
}

/* ------------------------------ Export ------------------------------ */
module.exports = WolframAlpha;

