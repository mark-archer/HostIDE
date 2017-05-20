
requirejs(
    ['/scripts/ui.utils.js',
     '/scripts/client.lang.js'],

    function(utils, lang) {

        //self.pathname = window.location.pathname;
        //self.pathname_search = window.location.search;
        //self.pathname_hash = window.location.hash;
        //utils.uPost(window.location.pathname,null,self.obj);

        var self = this;
        self.obj = ko.observable();


        self.loading = ko.observable(true);
        self.error = ko.observable();
        self.rslt = ko.observable();

        self.rslt_ui = ko.pureComputed(function(){
            var rslt = self.rslt();
            self.loading(rslt === undefined);
            if(_.isArray(rslt) && rslt[0] && rslt[0].ELEMENT_NODE)
                return true;
            if(rslt && (rslt.ELEMENT_NODE))
                return true;
            return false;
        });

        self.loadRsltUI = function(elem){
            elem = $('#rsltUI')[0];
            elem.innerHTML = '';
            ko.cleanNode(elem);
            var rslt = self.rslt();
            if(!_.isArray(rslt)) rslt = [rslt];
            _.each(rslt,function(c){
                if(c && c.ELEMENT_NODE)
                    elem.appendChild(c);
            });
            return true;
        };

        self.exec = function(code){
            if(!code)
                code = self.obj().code;
            self.rslt(undefined); self.error(undefined); self.loading(true);
            lang.exec(code, null, function(err, rslt){
                if(err) self.error(err);
                else self.rslt(rslt);
            });
        };

        self.run = function(code){
            if(!code)
                code = self.obj().code;
            self.rslt(undefined); self.error(undefined); self.loading(true);
            hostlang.run(code, null, self.rslt, self.error);
        };

        var path = window.location.href;
        path = path.replace(/\/run$/, '');
        utils.getByPath(path, function(obj){
            console.log(obj);
            self.obj(obj);
            if(obj){
                if(obj.type == utils.type_group_id)
                    Cookies.set('group',obj.id);
                else
                    Cookies.set('group',obj.group);
            }
            $(document).ready(function(){
                ko.applyBindings(self);

                self.exec();
            });

            //if(!obj) return; // no path to get so get out
            //utils.get_path(obj, function(rslt){
            //    if(rslt && rslt.err) return console.log(rslt);
            //    var path = rslt;
            //    if(!path) return; // path is already correct so get out
            //    path = window.location.origin + path;
            //    //return console.log(obj,path);
            //    if(path != window.location.href)
            //        window.location = path;
            //    else
            //        $(document).ready(function(){
            //            ko.applyBindings(self);
            //        });
            //});
        });
    }
);



