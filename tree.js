
function treeNameSpace(){
   this.root = null;
   this.presentNode = null;

/* Functions to move in the tree: go back, or to the next along a branch; to get the value.  */
   this.up = function(){
      if((this.presentNode != null)&&(this.presentNode != undefined)){
         this.presentNode = this.presentNode.getPrevious();
      } else {
         console.log("Already at the root node: no previous node.");
      };
   };
   this.down = function(){
      var ndown = this.presentNode.getNext(this.presentNode.getBranch());
      if((ndown != null)&&(ndown != undefined)){ this.presentNode = ndown;
      } else {
         console.log("No next level.");
      };
   };
/* to go back: one needs to check it is possible: is previous == null/undefined?*/
   this.createRoot = function(value){ 
      if((this.root != null)&&(this.root != undefined)) {
         this.root = this.createNode(value); 
      } else { console.log("treeNameSpace: createRoot: the root node already exists.");}; 
   };
   this.createNode = function(value){ return new node(value);};

   this.addNode = function(value){
      this.presentNode.addNext(this.createNode(value));
      this.down();
      console.log("treeNameSpace: addNode: added node and made it the presentNode");
   };
   
   /* The 'node'. */
   function node(value) {
      this.value = value;
      this.previous  = null;
      this.next  = null; /* It needs to be an array. */
      this.branch = -1;

      this.getValue = function(){
         if((this.value != null)&&(this.value != undefined)) {
            return this.value;
         } else {console.log("node: getValue: no value"); }; 
      };

      this.getPrevious = function(){ return this.previous; };
      this.setPrevious = function(nd){ this.previous = nd; };
      this.hasPrevious = function(){ return (this.previous!= null) && (this.previous != undefined); };

      this.getNext = function(idx){ 
         if((this.next != null) && (this.next != undefined) && (0 < this.next.length)) { 
            if((idx < this.next.length) && (-1 < idx)) { 
               return this.next[idx];
            } else { console.log("node: getNext: idx out of range"); return null;};
         } else {console.log("node: getNext: no next node"); return null;}; 
      };
      
      this.addNext = function(nd){ this.next
         if((this.next != null) && (this.next != undefined)) {
            this.next.push(nd);
            this.next[this.next.length-1].setPrevious(this);
            this.branch = this.branch + 1; // necessary? Is necessarily the last added?
         } else {
            this.next = [];
            this.next.push(nd);
            this.next[this.next.length-1].setPrevious(this);
            this.branch = 0;
         }; 
      };
      
      this.removeNext = function(idx){
         if((this.next != null) && (this.next != undefined) && (0 < this.next.length)) { 
            if((idx < this.next.length) && (-1 < idx)) {
            /* To pop out of the array I put the element at the end. */
               var tmp = this.next[idx];
               this.next[idx] = this.next[this.next.length-1];
               this.next[this.next.length-1] = tmp;
               this.next.pop();
               if((idx == this.getBranch()) && (this.getBranch() > -1)) {
                   this.setBranch(0);
               } else { this.setBranch(-1); };
            } else { console.log("node: removeNext: idx out of range"); };
         } else {console.log("node: removeNext: no next node"); };           
      };
      
      this.isNextEmpty = function(){
         return ((this.next != null) && (this.next != undefined));
      };

      this.setBranch = function(brnc){ 
         if((this.next != null) && (this.next != undefined)){
            if((brnc < this.next.length)&&(-1 < brnc)) { 
               this.branch = brnc;
            } else { console.log("node: setBranch: out of range branch index");};
         } else { console.log("node: setBranch: no next level");}
      };
      
      this.getBranch = function(){ 
         if((-1 < this.branch) &&(this.branch<this.next.length)) {
            return this.branch;
         } else {
            console.log("node: getBranch: No branch.");
         };
      };
      
   };
   
};


