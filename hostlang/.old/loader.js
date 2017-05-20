var fs = require('fs');

var utils = require('../public/utils.js');
var fnjs = utils.fnjs;
var untick = utils.untick;

function eachSync(items, fn, context, callback){

    if(!_.isArray(items))
        return loader.host.ccError(context, "eachSync - items not a list");

    var exited = false;

    var i = -1;
    var rslts = [];
    function next(rslt){
        if(exited)
            return loader.host.ccError(context, 'eachSync has already exited');
        if(i > -1){
            rslts[i] = rslt;
        }
        i++;
        if(i>=items.length){
            exited = true;
            return callback(rslts);
        }
        fn(items[i], context, next);
    }
    next();
}

var loader = {};

loader = {codeRoot: __dirname + '\\hostlang\\'};
loader.osPath = function(path){
    if(path[0] === "/")
        path = path.substr(1);
    return loader.codeRoot + path;
};
loader.load = fnjs(function(expr, context, callback){
    loader.read.ccode(expr, context, function(ctx){
        var scope = _.last(context);
        if(!_.isArray(ctx))
            ctx = [ctx];
        ctx = _.flatten(ctx);
        _.map(ctx, function(ctx){
            for(var name in ctx)
                if(ctx.hasOwnProperty(name) && scope[name] !== ctx[name]){
                    if(scope[name])
                        console.warn("overwriting " + name);
                    scope[name] = ctx[name];
                }
        });
        callback(ctx);
    });
});
loader.load.isMacro = true;
loader.read = fnjs(function(expr, context, callback){
    expr = untick(expr);
    if(expr.length !== 1) return loader.host.ccError(context, ["load -- expected 1 argument, given " + expr.length, expr]);
    var path = untick(expr[0]).replace("\\app.asar\\", "\\app.asar.unpacked\\");
    var localPath = untick(expr[1]);

    var recursive = false;
    if(path[path.length-1] === "*"){
        recursive = true;
        path = path.substring(0,path.length-1);
    }

    var forceDir = false;
    if(path[path.length-1] === "/" || path[path.length-1] === "\\"){
        forceDir = true;
    }

    path = loader.osPath(path);
    if(path.toLowerCase().endsWith(".host"))
        return loader.readFile([path], context, callback);

    fs.lstat(path, function(err, stats){
        if(forceDir && (err || !stats.isDirectory()))
            return loader.host.ccError(context, "invalid directory " + path);
        if(err || !stats.isDirectory()){
            if(recursive) return loader.host.ccError(context, "recursive was indicated on a file, this is undefined");
            var filePath = path + ".host";
            return loader.readFile([filePath],context,callback);
        }
        loader.readDir([path, localPath, recursive], context, callback);
    });
});
loader.read.isMacro = true;
loader.redFiles = {};
loader.readFile = function(expr, context, callback){
    var fileName = expr[0].replace("\\app.asar\\", "\\app.asar.unpacked\\");

    if(loader.redFiles[fileName])
        return callback(loader.redFiles[fileName]);
    fs.readFile(fileName,'utf8', function(err, code){
        if(err)
            return loader.host.ccError(context,["error reading file " + fileName,err.message,err]);
        var ctx = {_sourceFile:fileName,exports:{}};
        loader.redFiles[fileName] = ctx.exports; // set before loaded, prevents infinite recursion of loading a->b->a->...
        //host.run(code, ctx, function (rslt) {
        loader.host.run(code, ctx, function (rslt) {
            // console.log(fileName);
            callback(ctx.exports);
        }, function(err){
            loader.host.ccError(context, [fileName, err]);
        });
    });
};
loader.readDir = function(expr, context, callback){
    var dirPath = expr[0].replace("\\app.asar\\", "\\app.asar.unpacked\\");
    
    var recursive = expr[2];

    if(dirPath[dirPath.length - 1] !== "/" && dirPath[dirPath.length - 1] !== "\\")
        dirPath += "\\";

    var files = fs.readdirSync(dirPath);
    files = _.map(files,function(f){return dirPath + f;});
    var hfiles = _.filter(files, function(f){return f.toLowerCase().endsWith(".host");});

    function callLoadFile(file, context, callback){
        loader.readFile([file], context, callback);
    }
    eachSync(hfiles,callLoadFile,context, function(rslt){
        if(!recursive) return callback(rslt);

        // call recursively if indicated
        var oFiles = _.difference(files,hfiles);
        oFiles = _.filter(oFiles, function(path){
            return fs.statSync(path).isDirectory(); // this could be speed up by doing async but I don't think it's worth the hassel
        });

        function callLoadDir(dirPath, context, callback){
            loader.readDir([dirPath, recursive], context, callback);
        }
        eachSync(oFiles,callLoadDir,context,function(subRslt){
            Array.prototype.push.apply(rslt, subRslt);
            callback(rslt);
        });
    });
};
loader.clearRedFiles = function(name){
    if(name === undefined)
        loader.redFiles = {};
    else{
        name = loader.osPath(name);
        delete loader.redFiles[name];
    }
};

module = module || {};
module.exports = loader;
