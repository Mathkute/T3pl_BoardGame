
function dtbsNameSpace() {

   this.oLabel = "dtbsNameSpace";
   this.rqList = [];

   this.checkDBState = function(dbName,osName){
      var rq = null;
      var label = "checkDBState";
      rq = window.indexedDB.open(dbName); 

      rq.onerror = function(event){
         console.log("dtbsNameSpace:" + label + " " + event.type + " " + event.detail);
      };

/* TODO: to check if there are any object stores, and list the indexes, if any. */
      rq.onsuccess = function(event){ 
         console.log(event.target.result);
         if((osName != null) && (osName != undefined)
                             && (event.target.result.objectStoreNames.length > 0 )){
            var trsct = event.target.result.transaction([osName]);
            var os = trsct.objectStore(osName);
            if((os != null) && (os != undefined) && (os.indexNames.length > 0))
               console.log(label + " " + os.indexNames[0]);
         } else {console.log(label + ": there is no " + osName + " Object Store");};
         event.target.result.close();
         console.log(event.target.result.name + " closed");
      };
   };

   this.createDB = function(dbName){
      var rq = window.indexedDB.open(dbName,1);
      rq.onsuccess = function(event){ 
         console.log("dtbsNameSpace: createDB: success");
         event.target.result.close();
      };
      // TODO:  dtbsNameSpace: createDB: add error code
      rq.onerror   = function(event){ console.log("dtbsNameSpace: createDB: error: ");};
   };

   this.deleteDB = function(dbName){
      var rq = window.indexedDB.deleteDatabase("dbName");
      rq.onerror = function(event){ console.log("dtbsNameSpace: deleteDB: error");};
      rq.onsuccess = function(event){ console.log("dtbsNameSpace: deleteDB: success, " + rq.readyState);};
   };

//

   this.createGameDBNOS = function(){
      var label = "createGameDBNOS";
      var dbName = "game", osName="gameOS";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace:" + label + ": get version: error: " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) 
            event.target.result.close();
      };

      rq.onsuccess = function(event){
         var version = rq.result.version;
         console.log(rq.result + " " + rq.result.version + " " + version);
         // I would need to add how to check if one of the entries is the name of the object store.
         if(rq.result.objectStoreNames.length ==0){
            console.log("Need to create the object store.");

            var rq2 = window.indexedDB.open(dbName,version+1);

            rq2.onerror = function(event){ 
               console.log("dtbsNameSpace:" + label + ": access to create Object Store: " + event.type);
               if((event.result != null) && (event.result != undefined)) {
                  console.log("closed database");
                  event.target.result.close();
               };
            };

            rq2.onsuccess = function(event){ 
               console.log("dtbsNameSpace:" + label + ": access to create Object Store: success");
            };

            rq2.onupgradeneeded = function(event){
               var os = rq2.result.createObjectStore(osName, {keyPath:"id"});
               console.log("dtbsNameSpace:" + label + ": created ObjectStore: " + os.name);

               event.target.result.close();
            };

         };
         rq.result.close();

      };
   };

   this.addGame = function(game){
      var label="addGame";
      var dbName = "game", osName = "gameOS";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) event.target.result.close();
      };

      rq.onsuccess = function(event){
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         console.log("dtbsNameSpace: "+ label + event.target.result);
         // console.log("dtbsNameSpace: "+ label + event.target.result.transaction);
         var trsct = event.target.result.transaction([osName],"readwrite");
         var os = trsct.objectStore(osName);

         os.onsuccess = function(event){
            console.log("dtbsNameSpace: "+ label + ": " + "accessing ObjectStore " + os.name);
         };

   /* The code is not robust: one may choose different options which may not be compatible with 
      the data format: ([]->) one may want to have wrapper functions specific to the data and 
      the indexing; I need to document the API I am writing, noticing details like how to specify 
      the options. */
         if((os != null) && (os != undefined)) {
            console.log("adding: " + game);
               // os.put(items[i]);
            var oldGameRq = os.get(1); 
            oldGameRq.onsuccess = function(event){
               os.delete(1);
               os.add({id: 1, game: game});
               console.log("dtbsNameSpace: " + label + ": added game");
               console.log("dtbsNameSpace: " + label + ": database closed");
            };
            event.target.result.close();
         } else {
            console.log("dtbsNameSpace: " + label + ": Object Store error.");
         };
      };
   };

   this.getGame = function(data){
      var label="getGame";
      var dbName = "game", osName = "gameOS";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) event.target.result.close();
      };

      rq.onsuccess = function(event){
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         console.log("dtbsNameSpace: "+ label + event.target.result);
         // console.log("dtbsNameSpace: "+ label + event.target.result.transaction);
         var trsct = event.target.result.transaction([osName],"readwrite");
         var os = trsct.objectStore(osName);

         os.onsuccess = function(event){
            console.log("dtbsNameSpace: "+ label + ": " + "accessing ObjectStore " + os.name);
         };

   /* The code is not robust: one may choose different options which may not be compatible with 
      the data format: ([]->) one may want to have wrapper functions specific to the data and 
      the indexing; I need to document the API I am writing, noticing details like how to specify 
      the options. */
         if((os != null) && (os != undefined)) {
            var oldGameRq = os.get(1); 
            oldGameRq.onsuccess = function(event){
               data.push(JSON.parse(event.target.result.game));
               console.log("dtbsNameSpace: " + label + ": got game " + JSON.parse(event.target.result.game));
               console.log("dtbsNameSpace: " + label + ": database closed");
            };
            event.target.result.close();
         } else {
            console.log("dtbsNameSpace: " + label + ": Object Store error.");
         };
      };
   };

    /*
     * to create the object store one needs to know the version of the database, which 
     * may change; for a single user one can suppose there is only one script that accesses 
     * the database; to know the version one needs to open the db, get it, close the database,
     * then open the db again with the increased version to trigger the onupgradeneeded event,
     * and so have defined the function;
     */

   this.createOS = function(dbName, osName, options){
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: createOS: get version: error: " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) 
            event.target.result.close();
      };

      rq.onsuccess = function(event){
         var version = rq.result.version;
         console.log(rq.result + " " + rq.result.version + " " + version);
         rq.result.close();
         var rq2 = window.indexedDB.open(dbName,version+1);

         rq2.onerror = function(event){ 
             console.log("dtbsNameSpace: createOS: access to create Object Store: " + event.type);
             if((event.result != null) && (event.result != undefined)) {
                console.log("closed database");
                event.target.result.close();
             };
         };

         rq2.onsuccess = function(event){ 
             console.log("dtbsNameSpace: createOS: access to create Object Store: success");
         };

         rq2.onupgradeneeded = function(event){
             var os = rq2.result.createObjectStore(osName, options.osopts);
             console.log("dtbsNameSpace: createOS: created ObjectStore: " + os.name);

             os.createIndex("id", options.osopts.keyPath, {unique: true});
             //os.createIndex(options.osopts.keyPath, options.osopts.keyPath, {unique: true});
             if(os.indexNames.length > 0)
                console.log(os.indexNames.length + " " + os.indexNames[0]);
             
             event.target.result.close();
         };

      };
   };

   this.addItems = function(dbName,osName,items){
      var label="addItems";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) event.target.result.close();
      };

      rq.onsuccess = function(event){
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         console.log("dtbsNameSpace: "+ label + event.target.result);
         // console.log("dtbsNameSpace: "+ label + event.target.result.transaction);
         var trsct = event.target.result.transaction([osName],"readwrite");
         var os = trsct.objectStore(osName);

         os.onsuccess = function(event){
            console.log("dtbsNameSpace: "+ label + ": " + "accessing ObjectStore " + os.name);
         };

   /* The code is not robust: one may choose different options which may not be compatible with 
      the data format: ([]->) one may want to have wrapper functions specific to the data and 
      the indexing; I need to document the API I am writing, noticing details like how to specify 
      the options. */
         if((os != null) && (os != undefined)) {
            var count = 0;
            for(var i=0; i<items.length; i++){
               count+=1;
               console.log("adding: " + items[i]);
               // os.put(items[i]);
               os.add(items[i]);
            };
            console.log("dtbsNameSpace: " + label + "added " + count + " items");
            event.target.result.close();
            console.log("dtbsNameSpace: " + label + ": database closed");
         } else {
            console.log("dtbsNameSpace: " + label + ": Object Store error.");
         };
      };
   };

   this.listOSEntries = function(dbName, osName){
      var label = "listOSEntries";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) event.target.result.close();
      };

      rq.onsuccess = function(event){
         console.log("dtbsNameSpace: "+ label + ": " + event.type);
         console.log("dtbsNameSpace: "+ label + event.target.result);
         // console.log("dtbsNameSpace: "+ label + event.target.result.transaction);
         // "readonly" possibly is the default option
         var trsct = event.target.result.transaction([osName],"readonly"); 
         var os = trsct.objectStore(osName);
         var crsr = os.openCursor();

         var count = 0;
         crsr.onsuccess = function(event){
            var cursor=event.target.result;
            count +=1;
            // console.log(cursor + " " + count);
            if(cursor){
               var s="";
               var i = cursor.value;
               for(var p in i) s+= p + " " + i[p] + " " ;
               console.log(count + " " + s);
               cursor.continue();
            } else { console.log("End of list."); };
         };
         /*
         var index = os.index("id");
         console.log("Keys in the index.");
         var idxrq = index.getAllKeys();
         idxrq.onsuccess = function(event){ console.log("index: " + event.target.result);};
         */
         os.onsuccess = function(event){
            console.log("dtbsNameSpace: "+ label + ": " + "accessing ObjectStore " + os.name);
         };

         console.log("dtbsNameSpace: "+ label + ": " + "closed database");
         event.target.result.close();

      };

   };


/*
   this.createOSIdx = function(dbName, osName, idxName, options) {
      var label = "createOSIdx";
      var rq = window.indexedDB.open(dbName);

      rq.onerror   = function(event){ 
         console.log("dtbsNameSpace: createOS: getVersion: error: " + event.type);
         if((event.target.result != null) && (event.target.result != undefined)) event.target.result.close();
      };

      rq.onsuccess = function(event){
         var version = event.target.result.version;
         console.log(event.target.result + " " + event.target.result.version + " " + version);
         rq.result.close();
         var rq2 = window.indexedDB.open(dbName,version+1);

         rq2.onerror = function(event){ 
             console.log("dtbsNameSpace: " + label + ": access to create index to the OS: " + event.type + " " + event.detail);
             if((event.result != null) && (event.result != undefined)) {
                console.log("closed database");
                event.target.result.close();
             };
         };

         rq2.onsuccess = function(event){ 
             console.log("dtbsNameSpace: " + label + ": access to create Object Store's index: success");
         };

         rq2.onupgradeneeded = function(event){
             var tr = rq2.result.transaction([osName],"readwrite");
             var os = tr.objectStore(osName);
             console.log(label + " creating index: " + options.keyPath);
             var index = os.createIndex(idxName, options.keyPath, {unique: true});
             console.log("dtbsNameSpace: createOS: created index: " + index.name);
             console.log(index.getAllKeys());
             event.target.result.close();
         };
      };
   };
*/
   this.util = new utilFunctions();

   function options(keyPath, autoincrement, keyName){};
   function utilFunctions(){};

/* */
   function data(){
      this.a = 1;
      this.b = 2;
   };

/* */
   this.fnc = function(dbName, osName){
      var rq = window.indexedDB.open(dbName);

      rq.onerror = function(event){
         console.log(event.detail);
         if((event.target.result != undefined) && (event.target.result != null)) {
            event.target.result.close();
            console.log("closed " + dbName);
         };
      };

      rq.onsuccess = function(event){
         var os = event.target.result.transaction([osName],"readwrite").objectStore(osName);
/*          
         for(var i=0; i < 8; i++) os.add({id: 21+i, a:i, b: new data()});
         console.log("added data to " + dbName + "." + osName);
*/
         for(var i=0; i < 8; i++) os.delete(11+i);
         console.log("deleted data from " + dbName + "." + osName);

         var rqdt = os.get(12);
         rqdt.onsuccess = function(event){
            if((event.target.result != null) && (event.target.result != undefined))
               console.log("data: id=" + rqdt.result.id + " a=" + rqdt.result.a);
            else {console.log("No data.");};   
         //console.log("data: id=" + rqdt.result.id + " a=" + rqdt.result.a + " " + rqdt.result.b.a);
            rq.result.close();
            console.log("closed " + dbName);
         };
         rqdt.onerror = function(event){
            console.log(event.type + " " + event.detail);
            rq.result.close();
            console.log("closed " + dbName);
         };
      };
   };

};

