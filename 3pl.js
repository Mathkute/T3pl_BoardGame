
/*
 * Modified version of the 3pl.js file: I need to encapsulate the namespace, so I will create
 * a function 3plNameSpace where everything is hidden; also I will have canvas_init and canvas_draw
 * as functions that refer to that name space when loading the page and drawing the canvas;
 */


/*
if(window.indexedDB) window.alert("The browser supports IndexedDB.");
*/

function save_IDB(){ 
   var s = JSON.stringify(trplSession.getBoard());
   trplSession.dbns.addGame(s);
   document.getElementById("save_msg_2").innerHTML="saved game in IDB";
};

function save(){ 
   var s = JSON.stringify(trplSession.getBoard());
   trplSession.svdata = {id:101, s: s};
   document.getElementById("save_msg_1").innerHTML="saved game";
};

function load(){ 
   trplSession.setBoard(JSON.parse(trplSession.svdata.s)); 
   console.log("Load: " + trplSession.getBoard().listTiles[1].dirs);
   draw();
};

/*
function load_IDB(){
   var dt = [] 
   trplSession.dbns.getGame(dt);
   while(dt == undefined){};
   console.log(dt[0]);
   trplSession.setBoard(JSON.parse(dt[0])); 
   console.log("Load: " + trplSession.getBoard().listTiles[1].dirs);
   draw();
};
*/

function load_IDB(){
   var rq = window.indexedDB.open("game");
   rq.onsuccess = function(event){
      var tr = rq.result.transaction("gameOS","readwrite");
      var os = tr.objectStore("gameOS");
      var rqdt = os.get(1);
      rqdt.onsuccess = function(event){
         trplSession.setBoard(JSON.parse(event.target.result.game));
         console.log("Load: " + trplSession.getBoard().listTiles[1].dirs);
         draw();
      };
   };

};

var trplSession = new trplNameSpace();
function init(){ trplSession.init();};
function draw(){ trplSession.draw();};

function trplNameSpace(){

   this.dbns = new dtbsNameSpace();
   this.view_o = new view_f();

// directions: 1:sw, 2:w, 3:nw, 4:n, 5:ne, 6: e, 7: se, 8: s
// to the left (w) -1, to the right (e) +1
// to the bottom (s) +1, to the top (n) -1
   var nnidx =[[-1,+1],[-1,0],[-1,-1],[0,-1],[+1,-1],[+1,0],[+1,+1],[0,+1]];
   var board = new board_f();
/* {nx: 8, ny: 8, listTiles: null, border: 2, gap: 3, side: 30, turn: 0, listCounters:[], 
gameEnd: false}; */

// model_f
// model_f
   this.svdata = null;
   this.getBoard = function(){return board; };
   this.setBoard = function(bd){ board = bd; };
   this.newBoard = function() { return new board_f();};
   function board_f(){
      this.nx = 8;
      this.ny = 8;
      this.border = 2;
      this.gap = 3;
      this.side = 30;
      this.gameEnd = false;
      this.turn = 0;
      this.listTiles = genListTiles(this.side, this.nx, this.ny);
      this.listCounters = [];

      this.toJSON = null; // function(){};
      this.toString = function(){
         s = "";
         s += "{";
         s += " nx: " + this.nx;
         s += ", ny: " + this.ny;
         s += ", border: " + this.border;
         s += ", gap: " + this.gap;
         s += ", side: " + this.side;
         s += ", gameEnd: " + this.gameEnd;
         s += ", turn: " + this.turn;
         s += ", listTiles: [";
         if((this.listTiles != null) && (this.listTiles != undefined) && (this.listTiles.length > 0)) {
            s += this.listTiles[0].toString() + ",";
            for(var i=1; i< this.listTiles.length; i++) {
               s += "," + this.listTiles[i].toString();
            };
         };
         s += "]";
         s += ", listCounters: [";
         if((this.listCounters != null) && (this.listCounters != undefined) && (this.listCounters.length > 0)) {
            s += this.listCounters[0].toString() + ",";
            for(var i=1; i< this.listCounters.length; i++) {
               s += "," + this.listCounters[i].toString();
            };
         };
         s += "]";
         s += "}";

         return s;
      };

      function genListTiles(side, nx, ny){
         var level = -1, id = [0,0,0,0], list = [];
         next(level,id,list);
         list.push(null);
         list.push(null);
         list.push(null);
         list.push(null);

/*
         console.log(list.length);
         for(var i=0; i< list.length; i++){
            console.log( i + " " + list[i]);
         };
*/

         /* shuffling the list */
         var  tmp = [];
         for(var i=list.length -1; i >= 0; i--){
            var j = Math.floor(i * Math.random());
            // console.log(i + " " + j + " " + list[i] + " " + list[j]);
            tmp = list[i];
            list[i] = list[j];
            list[j] = tmp;
         }

         var listTiles = [];

         for(var i=0; i<nx; i++){
            for(var j=0; j<ny; j++){
                listTiles.push(new tile_f([i,j], null, "empty", null, null));
/* {coord:[i,j], dirs:null, shp:"empty", select:null, counter:null});
   listTiles.push({coord:[i,j], dirs:null, shp:"empty", select:null, counter:null}); */
            }
         }

         listTiles[0].shp = "filledsquare"; // [-1,-1,-1];
         listTiles[7].shp = "filledcircle"; // [-1,-1,-1];
         listTiles[56].shp = "emptycircle"; // [-1,-1,-1];
         listTiles[63].shp = "emptysquare"; // [-1,-1,-1];
         listTiles[56].counter = "bluecircle"; // [-1,-1,-1];
         listTiles[63].counter = "redsquare"; // [-1,-1,-1];

         var k =0;
         for(var i=0; i<64 && k<list.length; i++){
            if(listTiles[i].shp == "empty") {
               listTiles[i].dirs = list[k]; 
               if(list[k] != null) { 
                  listTiles[i].shp="triplet"; 
               };
               k++;
            };
         };

         return listTiles;
      }; /* genListTiles() */

// usage: 'var level = -1, id = [0,0,0,0], list = [];'
      function next(level, id, listaTriplets){
         level++;
         if(level <3) {
            for(var i = id[level]+1; i<=(8 - (3 - (1 + level))); i++){
               id[level+1] = i;
               next(level, id, listaTriplets);
            }
         } else {
            aId = new Array(3);
            for(var i =0; i<3; i++) { aId[i] = id[i+1]; }
            listaTriplets.push(aId);
            // console.log(aId);
         };
         level--;
      }; /* next() */
   }; /* board_f()  */

   function counter_f(name,coord_x, coord_y, idxEndTile){
      this.name = name;
      this.coords = [coord_x, coord_y];
      this.idxEndTile = idxEndTile;

      this.toString = null;// function(){}; 
      this.toJSON   = null;
   };

   function move_f(turn, listCounters) {
      this.turn = turn;
      this.listCounters = listCounters;
      this.toString = null; // function(){}; 
      this.toJSON   = null;
   };

   function game_state_f(board, counters){
      this.board = board;
      this.turn = 0; // the list of counters is in the board;
      this.toString = null; //function(){};
      for(var i=0; i<counters.length; i++) this.counters.push(counters[i]);
   };
/* {coord:[i,j], dirs:null, shp:"empty", select:null, counter:null}); */ 
   function tile_f(coords, dirs, shp, select, counter){
      this.coord   = coords;
      this.dirs    = dirs;
      this.shp     = shp;
      this.select  = select;
      this.counter = counter;

      // this.toString = null;
      // this.toJSON   = null;
   };

// counters: {"redsquare": [7,7], "redcircle": null, "bluesquare":null, "bluecircle":[0,7]}}

/* Trippple rules: the counter's moves are given by the arrows, if any, drawn in the other counter's tile. */
   function computeMoves(allFlag){
      var listMoves = [];
      var turn=board.turn, coords = board.listCounters[((turn+1)%board.listCounters.length)].coords;
      var dirs = []; 
      var x=0, y=0;

      if(allFlag != true) 
         dirs = board.listTiles[coords[0] + coords[1]*board.nx].dirs;
      else dirs = null;

      var cntr = board.listCounters[turn];
      coords = cntr.coords;

      if(dirs != null) {
         for(var i=0; i<dirs.length; i++) {
            x = coords[0] + nnidx[dirs[i]-1][0]; // dirs is from 1 to 8
            y = coords[1] + nnidx[dirs[i]-1][1];
            if((x<8) && (x>=0) && (y<8) && (y>=0)) {
               listMoves.push([x,y]);
               board.listTiles[x+y*board.nx].select = "available";
         };
      };
      } else {
         for(var i=0; i<8; i++) {
            x = coords[0] + nnidx[i][0];
            y = coords[1] + nnidx[i][1];
            if((x<8) && (x>=0) && (y<8) && (y>=0)) {
               listMoves.push([x,y]);
               board.listTiles[x+y*board.nx].select = "available";
            };
         };
      };

      return listMoves;
   };

   this.init = function(){
      var canvas = document.getElementById('tutorial');
      canvas.addEventListener( "click", showCoords, false);
//   console.log("Init script. " + canvas.getContext('2d').lineWidth + " " + canvas.getContext('2d').strokeStyle);
/*
      var lTls = genBoardList(board.side, board.nx, board.ny);
      for(var i=0; i < lTls.length; i++) {
         board.listTiles[i] = lTls[i]};
*/
      board.listCounters.push(new counter_f("redsquare", 7, 7, 0));
      board.listCounters.push(new counter_f("bluecircle", 0, 7, 7));
/*
      board.listCounters.push({name:"redsquare",  coords:[7,7], idxEndTile: 0});
      board.listCounters.push({name:"bluecircle", coords:[0,7], idxEndTile: 7});
 */
      computeMoves(false);
   };

  this.draw = function(){
     var canvas = document.getElementById('tutorial');
     if(canvas.getContext){
        var ctx = canvas.getContext('2d');
        if(canvas.getContext) {
           var ctx = canvas.getContext("2d");
           this.view_o.drawBoard(ctx, board); 
         };
      };
   };

/* I need to change the name of the function: it is used to handle the event;
*/

   function showCoords(e){
       if(board.gameEnd == true) return;
       // console.log("event target: " + e.target);
       // console.log("from left: " + e.target.offsetLeft);
       // console.log("from top: " + e.target.offsetTop);
       // console.log( (e.clientX -e.target.offsetLeft) + " " + (e.clientY - e.target.offsetTop));
       var i=-1, j = -1;
       i = e.clientX - e.target.offsetLeft - board.border;
       i /= 2*board.side + board.gap;
       i = Math.floor(i);
       j = e.clientY - e.target.offsetLeft - board.border;
       j /= 2*board.side + board.gap;
       j = Math.floor(j);


       if((0<=i) && (i<board.nx) && (0<=j) &&(j<board.ny)) {
           // console.log("i: " + i + " j: " + j /*+ " " + listTiles[i+board.nx*j].dirs*/ );
           /* 
           if(board.listTiles[i + board.nx*j].select == "selected") {
               board.listTiles[i + board.nx*j].select = null;
           } else {
               board.listTiles[i + board.nx*j].select = "selected";
           }
           */
           var cntr = board.listCounters[board.turn];
           tile = board.listTiles[i+j*board.nx];
           var lm = computeMoves(false);
           if(lm.length == 0) {
              console.log("no possible moves");
              board.turn++;
              board.turn %= board.listCounters.length;
              // reset listTiles
              for(var k=0; k<board.listTiles.length; k++){
                 board.listTiles[k].select = null;
              }
              computeMoves(true);
           }
           if(tile.select == "available"){
              board.listTiles[cntr.coords[0]+cntr.coords[1]*board.nx].counter = null;
              cntr.coords[0] = i;
              cntr.coords[1] = j;
              tile.counter = cntr.name;
              // reset listTiles
              for(var k=0; k<board.listTiles.length; k++){
                 board.listTiles[k].select = null;
              }
              board.turn++;
              board.turn %= board.listCounters.length;
              computeMoves();
           }
           draw();
           // console.log(cntr.idxEndTile + " " + (i+board.nx*j));
           if(cntr.idxEndTile == (i+board.nx*j)){
              board.gameEnd = true;
           };
           //console.log(board.listCounters[board.turn].name);
       };
   };

/*
 *
 */


// view_f
   function view_f(){
      this.drawBoard = function(ctx, bd){
         var x0 = 0;
         var y0 = 0;
         var nx = bd.nx, ny=bd.ny, side = board.side;
         var border = bd.border, gap = bd.gap;
         var listTiles = bd.listTiles;
         for(var i=0; i<nx; i++){
            for(var j=0; j<ny; j++){
               x0 = border + (2*i+1)*side + (i*gap);
               y0 = border + (2*j+1)*side + (j*gap);
               drawTile(ctx,x0,y0,side,listTiles[i+j*nx]);
               // if(listTiles[i+j*nx].shp == "filledcircle") console.log("filled: " + i + " " + j);
               // if(listTiles[i+j*nx].shp == "emptycircle") console.log("empty: " + i + " " + j);
            }
         }
      }

      function drawTile(ctx, x0, y0, side, tile){
         var fStyle = ctx.fillStyle;
         ctx.beginPath();
         ctx.clearRect(x0-side-2,y0-side-2, 2*side+4, 2*side+4);
         switch(tile.select){
              case "selected":
                  console.log("selected");
                  ctx.save();
                  ctx.strokeStyle = "green";
                  ctx.lineWidth = 4;
                  // ctx.strokeStyle = "rgba(0,255,0,0)";
                  ctx.strokeRect(x0-side,y0-side,2*side,2*side);
                  ctx.strokeStyle = "#000000";
                  ctx.restore();
                  break;
              case "available":
                  ctx.save();
                  ctx.strokeStyle = "blue";
                  ctx.lineWidth = 4;
                  ctx.strokeRect(x0-side,y0-side,2*side,2*side);
                  ctx.strokeStyle = "#000000";
                  ctx.restore();
                  break;
              default: 
                  ctx.strokeRect(x0-side,y0-side,2*side,2*side);
                  break;
         }
         var dirs = tile.dirs;
         ctx.moveTo(x0, y0);
         switch(tile.shp){
             case "empty": 
                 break;
             case "triplet":
                 if((dirs != null) && (dirs != undefined)){
                     createTransform(ctx,x0,y0,dirs[0]);
                     drawArrow(ctx, x0, y0, side);
                     createTransform(ctx,x0,y0,dirs[1]-dirs[0]);
                     drawArrow(ctx, x0, y0, side);
                     createTransform(ctx,x0,y0,dirs[2]-dirs[1]);
                     drawArrow(ctx, x0, y0, side);
                     createTransform(ctx,x0,y0,-dirs[2]);
                 } 
                 break;
             case "filledsquare":
                 ctx.fillRect(x0-(2.0*side)/3.0,y0-(2.0*side)/3.0,(4.0*side)/3.0,(4.0*side)/3.0);
                 break;
             case "emptysquare":
                 ctx.strokeRect(x0-(2.0*side)/3.0,y0-(2.0*side)/3.0,(4.0*side)/3.0,(4.0*side)/3.0);
                 break;
             case "emptycircle":
                 ctx.moveTo(x0 + side*(2.0/3.0), y0);
                 ctx.arc(x0, y0, side*(2.0/3.0), Math.PI*2, 0);
                 ctx.stroke();
                 break;
             case "filledcircle":
                 ctx.moveTo(x0 + side*(2.0/3.0), y0);
                 ctx.arc(x0, y0, side*(2.0/3.0), Math.PI*2, 0);
                 ctx.fill();
                 break;
         }
         if(tile.counter != null){
             switch(tile.counter){
                 case "redsquare": 
                     clr = "rgba(255,0,0,0.3)";
                     drawSquare(ctx, x0, y0, side*(2.0/3.0), clr);
                     break;
                 case "redcircle": 
                     clr = "rgba(255,0,0,0.3)";
                     drawCircle(ctx, x0, y0, side*(2.0/3.0), clr);
                     break;
                 case "bluesquare": 
                     clr = "rgba(0,0,255,0.3)";
                     drawSquare(ctx, x0, y0, side*(2.0/3.0), clr);
                     break;
                 case "bluecircle": 
                     clr = "rgba(0,0,255,0.3)";
                     drawCircle(ctx, x0, y0, side*(2.0/3.0), clr);
                     break;
             }
         }
      };

      function drawSquare(ctx, x0, y0, side, clr){
         fStyle = ctx.fillStyle;
         ctx.fillStyle = clr;
         ctx.fillRect(x0-side,y0-side,2*side,2*side);
         ctx.stroke();
         ctx.fillStyle = fStyle;
      };

   function drawCircle(ctx, x0, y0, side, clr){
      fStyle = ctx.fillStyle;
      ctx.fillStyle = clr;
      ctx.moveTo(x0+side,y0);
      ctx.arc(x0,y0,side,Math.PI*2,0);
      ctx.fill();
      ctx.fillStyle = fStyle;
   };

   function createTransform(ctx, x0, y0, i){
      ctx.translate(x0,y0);
      ctx.rotate(i*Math.PI/4);
      ctx.translate(-x0,-y0);
   };

      function drawArrow(ctx, x0, y0, side){
         var a=(7*side)/100.0;
         var b=(60*side)/100.0;
         var c=(15*side)/100.0;
         var d=(40*side)/100.0;
         ctx.beginPath();
         ctx.arc(x0,y0,2,Math.PI*2,0);
         ctx.fill()
         ctx.moveTo(x0+a,y0);
         ctx.lineTo(x0+a,y0+b);
         ctx.lineTo(x0+a+c,y0+b);
         ctx.lineTo(x0,y0+b+d);
         ctx.lineTo(x0-a-c,y0+b);
         ctx.lineTo(x0-a,y0+b);
         ctx.lineTo(x0-a,y0);
         ctx.closePath();
         ctx.stroke();
      };
   }; // view_f


   // function showMoves(){ }

}; // End of 3plNameSpace 
/**/

