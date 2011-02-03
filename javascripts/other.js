/*
   Class: Layer
   A class to represent a generic layer.
*/
var Layer=new Class({
	/*
	 * Function: initialize
	 * constructor for a new layer object
	 */
	initialize: function(options){
		this.opacity=(options.opacity)?options.opacity:1;
		this.type=options.type;
		this.name=options.name;
		this.hidden=false;
	},
	/*
	 * Function: setOpacity
	 * sets the opacity of this layer
	 * Parameters:
	 * op - number between 0 and one
	 */
	setOpacity:function(op){
		this.opacity=op;
	},
	/*
	 * Function: setName
	 * sets the name of the this layer
	 * Parameters:
	 * name -the new name
	 */
	setName:function(name){
		this.name=name;
	},
	/*
	 * Function: hide
	 * sets this layer to hidden
	 */
	hide:function(){
		this.hidden=true;
	},
	/*
	 * Function show
	 * sets this layer to visible
	 */
	show:function(){
		this.hidden=false;
	},
	/*
	 * Function: isHidden
	 * Checks whether this layer is hidden
	 * Returns:
	 * True if this layer is hidden, false if it's not
	 */
	isHidden:function(){
		return (this.hidden==true);
	},
	/*
	 * Function: isImg
	 * Checks whether this layer is an image
	 * Returns:
	 * True if it is, false otherwise
	 */
	isImg:function(){
		return(this.type=="image");
	}

});

/*
   Class: Text
   A class to represent a text layer
   Extends:
   <Layer>
   See Also:
   <Layer>
*/
var Txt=Layer.extend({
	/*
	 * Function: initialize
	 * Constructs a new text layer
	 * Parameters:
	 * options - can include font,size,style,color,value;
	 */
	initialize: function(options){
		options.type="text";
		this.options=options;
		this.parent(options);
		this.font=(options.font)? options.font : "arial";
		this.size=(options.size)? options.size : "18pt";
		this.style=(options.style)?options.style:"normal";
		this.color=(options.color)? options.color : "#000000";
		this.value=(options.value)? options.value : "Enter Text";
		this.weight=(options.weight)? options.weight : 400;
	},
	/*
	 * Function: getValue
	 * gets the value of this text layer
	 * Returns:
	 * the value of this text layer as a string
	 */
	getValue:function(){
		return this.value;
	},
	/*
	 * Function setValue
	 * sets the value of this text laer
	 * Parameters:
	 * val - the new value for the current text layer
	 */
	setValue:function(val){
		this.value=val;
	},
	/*
	 * Function update
	 * updates all the options of this text layer
	 * Parameters:
	 * options- options string. See initalize.
	 */
	update:function(options){
		this.parent(options);
		this.font=(options.font)? options.font : this.font;
		this.size=(options.size)? options.size : this.size;
		this.style=(options.style)?options.style:this.style;
		this.color=(options.color)? options.color : this.color;
		this.value=(options.value)? options.value : this.value;
		this.weight=(options.weight)? options.weight : this.weight;
	}
});


/*
   Class: ImgLayer
   A class to represent an image layer
   Extends:
   <Layer>
   See Also:
   <Layer>
*/
var ImgLayer=Layer.extend({
	
	/*
	 * Function: initialize
	 * Creates a new ImgLayer Object
	 * Parameters:
	 * options - can include the following: src,
	 */
	initialize:function(options){
		options.type="image";
		this.parent(options);
		this.src=options.src;
		this.cursrc=this.src;
		this.img=new Image();
		this.img.src=this.src;
		this.hist=Array();
	},
	/*
	 * Function: apply
	 * Applies a filter to this image layer
	 * Parameters:
	 * name -the filter name
	 * value(optional) - value of the filter to be applied
	 */
	apply:function(name,value){
		if(name=="resize")this.undoResize();
		if(name=="rotate")this.updateRotate();
		if(value)
		this.hist[this.hist.length]=name + "=" + value;
		else
		this.hist[this.hist.length]=name;
		//create the parameters string
		var params="?img=" + encode64(this.src);
		for(var i=0;i<(this.hist.length);i++){
			var prfx=(i<10)?"0" + i:i;
			params+="&" + prfx +this.hist[i];
		};
		this.updateImg(params);	
	},
	/*
	 * Function:applyMult
	 * Applies Multiple filters to this image
	 * Parameters:
	 * flist - an array of filters
	 */
	applyMult:function(flist){
		var params="?img=" + encode64(this.src);
		for(var i=0;i<flist.length;i++){
			var name=flist[i][0];
			var value=flist[i][1];
			//if(name=="resize")this.undoResize();
			if(value)
			this.hist[this.hist.length]=name + "=" + value;
			else
			this.hist[this.hist.length]=name;
		}
		for(var i=0;i<(this.hist.length);i++){
		var prfx=(i<10)?"0" + i:i;
		params+="&" + prfx +this.hist[i];}
		this.updateImg(params);			
	},
	
	/*
	 * Function: updateImg
	 * updates the current image applying the filters
	 * Parameters:
	 * params - string containing all the filter applications for this layer
	 */
	updateImg:function(params){
		var temp=new Image();
		var comp=new Image();
		temp.src="/editor/edit" + params;
		this.cursrc=temp.src;
		this.img.src=temp.src;
		
	},
	/*
	 * Function: getSrc
	 * Returns:
	 * the URL of this image layer
	 */
	getSrc:function(){
		return this.cursrc;
	},
	/*
	 * Function: getWidth
	 * Returns:
	 * the width of the current image
	 */
	getWidth:function(){
		return this.img.width;
	},
	/*
	 * Function: getHeight
	 * Returns:
	 * the height of the current image
	 */
	getHeight:function(){
		return this.img.height;
	},
	/*
	 * Function: getRatio
	 * Returns:
	 * the ratio of width to height of this layer
	 */
	getRatio:function(){
		return this.getWidth()/this.getHeight();
	},
	/*
	 * Function undoLast
	 * Undoes the last filter application
	 */
	undoLast:function(){
		this.undoStep(this.hist.length-1);
	},
	/*
	 * Function: undoStep
	 * Undoes a given filter application
	 * Parameters:
	 * id - the id of the step to undo
	 */
	undoStep:function(id){
		var params="?img=" + encode64(this.src);
		this.hist.splice(id,1);
		for(var i=0;i<(this.hist.length);i++){
		var prfx=(i<10)?"0" + i:i;
		params+="&" + prfx +this.hist[i];}
		this.updateImg(params);	
	},
	/*
	 * Function: getHistory
	 * Gets the history of the current layer
	 * Returns:
	 * the history of the current layer
	 */
	getHistory:function(){
		return this.hist;
	},
	/*
	 * Function: undoResize:
	 * undoes previous resizes
	 */
	undoResize:function(){
		if( this.hist.length>1 &&this.hist[this.hist.length-1].contains("resize")){
			this.hist.pop();
		}
	},
	/*
	 * Function:updateRotate
	 * switches around the width and the height of an image on rotate
	 */
	updateRotate:function(){
		var temp=this.width;
		this.width=this.height;
		this.height=temp;
	},
	/*
	 * Function: getRWidth
	 * gets the corresponding width for a given height
	 * Parameters:
	 * height - the height
	 */
	getRWidth: function(height){
		return parseInt(height/this.getRatio());
		},
	/*
	 * Function: getRHeight
	 * gets the corresonding height for a given width
	 * Parameters:
	 * width - the width 
	 * 
	 */		
	getRHeight: function(width){
		return parseInt(width * this.getRatio());
		}
	
	


});



//encode BASE64
var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function encode64(input) {
   var output = "";
   var chr1, chr2, chr3;
   var enc1, enc2, enc3, enc4;
   var i = 0;

   do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
         enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
         enc4 = 64;
      }

      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + 
         keyStr.charAt(enc3) + keyStr.charAt(enc4);
   } while (i < input.length);
   
   return output;
}

