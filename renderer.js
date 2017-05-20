// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//__appRoot = __dirname;

var utils = require('./hostlang/utils.js');
var host = require('./hostlang/hostlang.js');

//console.log('renderer: ' + __dirname);

var ctx = {_sourceFile:'main.host'};//host.contextInit({},log,error);
ctx.clog = console.log;
ctx.cerr = console.error;
var appRoot = '.';

var divResults = $('#divResults')[0];
function log(rslt, isError) {
    //console.log('results',rslt);
    if(utils.isHTML(rslt))
        return $(divResults).prepend($(rslt));

    var pre = $('<pre></pre>')[0];
    if(isError)
        pre = $('<pre class="alert alert-danger" role="alert"></pre>')[0];

    console.log("finished in " + (Date.now() - ctx._startTime) + " ms");

    if(isError)
        console.error(rslt);
    else
        console.log(rslt);

    if(_.isString(rslt)){
        //$(pre).append($.parseHTML(rslt));
        pre.innerText = rslt;
    }
    else{
        pre.innerText = utils.dataToString(rslt,4);
    }

    $(divResults).prepend(pre);
}
ctx.cout = log;
function error(err){
    log(err, true);
}
function parse(code) {
    host.parse(code, ctx, log, error);
}
function run(code) {
    host.run(code, ctx, log, error);
}
function clearLog() {
    divResults.innerHTML = "";
}
function runTests() {
    run("core.loader.redFiles new!, load tests");
}

var fs = require('fs');
var hostMainPath = appRoot + '/main.host';

var txbx = $('#txtCode');
var txtCode = txbx[0];
try{
    txtCode.value = fs.readFileSync(hostMainPath,'utf8');
} catch (err){}
txbx.focus();
txtCode.setSelectionRange(0,0);
function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName === "textarea") || (activeElTagName === "input" &&
        /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart === "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}
txtCode.onkeydown = function (evt) {
    var caretPos = txbx.caret();

    // alt+r : run
    if(evt.keyCode == 82 && evt.altKey){
        run(evt.target.value);
    }

    // alt+p : see parse results
    //console.log(evt.keyCode);
    if(evt.keyCode == 80 && evt.altKey){
        parse(evt.target.value);
    }

    // alt+c : clear results
    if(evt.keyCode == 67 && evt.altKey){
        clearLog();
    }

    // alt+t : run tests
    if(evt.keyCode == 84 && evt.altKey){
        runTests();
    }

    // write to main file
    fs.writeFile(hostMainPath,evt.target.value);

    //console.log(evt);

    // tab -> insert or remove tab character
    if(evt.keyCode === 9){
        var txt = txbx.val();
        var txtBefore = txt.substring(0,caretPos);
        var txtAfter = txt.substring(caretPos);
        var lineStart = txtBefore.lastIndexOf('\n');
        lineStart = txtBefore.substring(lineStart);
        txtBefore = txtBefore.substring(0,txtBefore.length - lineStart.length);
        if(evt.shiftKey){
            // unindent if possible
            for(var i = 0; i<lineStart.length; i++){
                if(lineStart[i] === '\t'){
                    lineStart = lineStart.substring(0,i) + lineStart.substring(i+1);
                    caretPos--;
                    break;
                }
            }
        } else {
            // indent
            lineStart += '\t';
            caretPos++;
        }
        txbx.val(txtBefore+lineStart+txtAfter);
        txbx.caret(caretPos);
        evt.preventDefault();
    }

    // ctrl+enter -> run current line or selected text
    if(evt.keyCode === 13 && evt.ctrlKey){
        var selText = getSelectionText();
        if(!selText){
            var txt = txbx.val();
            var lineStart = txt.lastIndexOf('\n',caretPos);
            var lineEnd = txt.indexOf('\n',caretPos);
            if(lineStart < 0) lineStart = 0;
            if(lineEnd < 0) lineEnd = txt.length;
            selText = txt.substring(lineStart+1,lineEnd);
        }

        run(selText);
        evt.preventDefault();
    }

    // enter -> insert newline and same tabs/spaces as current line
    if(evt.keyCode === 13 && !evt.ctrlKey){
        var txt = txbx.val();
        var txtBefore = txt.substring(0,caretPos);
        var txtAfter = txt.substring(caretPos);
        var lineStart = txtBefore.substring(txtBefore.lastIndexOf('\n')+1);
        lineStart = '\n' + (lineStart.match(/^\s+/) || [""])[0];

        caretPos += lineStart.length;
        txbx.val(txtBefore+lineStart+txtAfter);
        txbx.caret(caretPos);
        evt.preventDefault();
    }

    // alt+arrow -> swap up
    if(evt.keyCode === 38 && evt.altKey && evt.shiftKey && !evt.metaKey && !evt.ctrlKey){
        var txt = txbx.val();
        var lines = txt.split('\n');

        var caretLine = 0;
        var caretOffset = 0;
        for(var i = 0; i<txt.length; i++){
            caretOffset = i - caretPos;
            i += lines[caretLine].length;
            if(i >= caretPos){
                break;
            }
            caretLine++;
        }
        if(caretLine > 0){
            var lineAbove = lines[caretLine-1];
            var line = lines[caretLine];
            lines[caretLine-1] = line;
            lines[caretLine] = lineAbove;

            txt = '';
            for(var i = 0; i<lines.length; i++)
                txt += lines[i] + '\n';
            txt = txt.substring(0,txt.length-1);
            txbx.val(txt);
            txbx.caret(caretPos - lineAbove.length - 1);
        }
    }

    // alt+arrow -> swap down
    if(evt.keyCode == 40 && evt.altKey && evt.shiftKey && !evt.metaKey && !evt.ctrlKey){
        var txt = txbx.val();
        var lines = txt.split('\n');

        var caretLine = 0;
        var caretOffset = 0;
        for(var i = 0; i<txt.length; i++){
            caretOffset = i - caretPos;
            i += lines[caretLine].length;
            if(i >= caretPos){
                break;
            }
            caretLine++;
        }
        if(caretLine < lines.length){
            var lineBelow = lines[caretLine+1] || "";
            var line = lines[caretLine];
            lines[caretLine+1] = line;
            lines[caretLine] = lineBelow;

            txt = '';
            for(var i = 0; i<lines.length; i++)
                txt += lines[i] + '\n';
            txt = txt.substring(0,txt.length-1);
            txbx.val(txt);
            txbx.caret(caretPos + lineBelow.length + 1);
        }
    }
};

//==============================================================
// load host files
//==============================================================

//var load = require(appRoot + "/hostlang/load");
//load.loadAll();

//host.run(main,ctx);

//run('load tests | "host ready"');
