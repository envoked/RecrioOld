/*
 * Class: Cropper
 * Arguments:
 * 		target - the layer id to add the cropper to
 * 		options - see Options below
 * Options:
 * 		initWidth - the initial width of the selection
 * 		initHeight - the initial height of the selection
 * 		maskColor  - the color of the masks(Unselected areas of the layer)
 * 		borderStyle -the style of the selection border
 * 	
 */
var Cropper=new Class({
	initialize:function(id,options){
		this.options={};
		this.setOptions(options);
		this.width=options.initWidth;
		this.height=options.initWidth;
		this.id=id;
		this.addEls(id);
		this.setStyles();
		this.setDims();
		
	},
	/*
	 * Function: setOptions
	 * Set the options
	 */
	setOptions:function(options){
		this.options.borderWidth=(options.borderWidth)?options.borderWidth:"1px";
		this.options.borderColor=(options.borderWidth)?options.borderColor:"#ff0000";
		this.options.borderStyle=(options.borderStyle)?options.borderStyle:"dashed";
		this.options.maskColor=(options.maskColor)?options.maskColor:"#000000"
	},
	/*
	 * Function: addEls
	 * adds all the elements needed for the cropper
	 */
	addEls:function(id){
		this.parent=$("lwrap_"+ id);
		this.tmask=new Element('div',{'class':'mask','id':'tmaskEl_' + id});
		this.lmask=new Element('div',{'class':'mask','id':'lmaskEl_' + id});
		this.rmask=new Element('div',{'class':'mask','id':'rmaskEl_' + id});
		this.bmask=new Element('div',{'class':'mask','id':'bmaskEl_' + id});
		this.selEl=new Element('div',{'class':'mask','id':'selectEl_' + id});
		this.selEl.setHTML('<image id="resizec_' + id + '"class="resize" src="/images/resize.png"/>');
		//insert in parent
		this.tmask.injectInside(this.parent);
		this.lmask.injectInside(this.parent);
		this.rmask.injectInside(this.parent);
		this.bmask.injectInside(this.parent);
		this.selEl.injectInside(this.parent);		
	},
	/*
	 * Function: setDims
	 * Sets the cropper and mask dimmesions
	 */
	setDims:function(){
		var parentWidth=parseInt($("lwrap_"+ this.id).getStyle("width"));
		var parentHeight=parseInt($("lwrap_"+ this.id).getStyle("height"));
		this.selEl.style.top=parseInt((parentHeight-this.height)/2) + "px";
		this.selEl.style.left=parseInt((parentWidth-this.width)/2) + "px";
		this.selEl.style.width=this.width + "px";
		this.selEl.style.height=this.height +"px";
		//set top mask dimmensions
		this.tmask.setStyle("height",parseInt(this.selEl.getStyle("top"))+ "px");
		this.tmask.style.top="0px";
		this.tmask.setStyle("width",parentWidth+ "px");
		//set left mask dimmensions
		this.lmask.setStyle("height",parseInt(this.selEl.getStyle("height"))+ "px");
		this.lmask.setStyle("width",parseInt(this.selEl.getStyle("left"))+ "px");
		this.lmask.style.top=this.selEl.style.top
		//set right mask dimmensions		
		this.rmask.setStyle("height",parseInt(this.selEl.getStyle("height"))+ "px");
		this.rmask.setStyle("width",(parentWidth-this.selEl.getStyle("left").toInt()-this.selEl.getStyle("width").toInt())+ "px");		
		this.rmask.style.top=this.selEl.style.top
		this.rmask.style.left=parseInt(this.selEl.style.left) + parseInt(this.selEl.style.width)+ "px";
		//set bottom mask dimmesions
		this.bmask.setStyle("height",(parentHeight- parseInt(this.selEl.getStyle("height"))-parseInt(this.selEl.getStyle("top")))+ "px");
		this.bmask.setStyle("width",parentWidth+ "px");
		this.bmask.style.top=parseInt(this.selEl.style.top)+parseInt(this.selEl.style.height) + "px";
	},
	/*
	 * Function: setStyles
	 * Sets the style of all the cropper elements
	 */
	setStyles:function(){
		//set the border for the selection
		this.selEl.setStyle("borderStyle",this.options.borderStyle);
		this.selEl.setStyle("borderWidth",this.options.borderWidth);
		
		//set all the styles for the masks
		this.tmask.setStyle("background-color",this.options.maskColor);
		this.tmask.setOpacity(0.4);
		
		this.lmask.setStyle("background-color",this.options.maskColor);
		this.lmask.setOpacity(0.4);
		
		this.rmask.setStyle("background-color",this.options.maskColor);
		this.rmask.setOpacity(0.4);
		
		this.bmask.setStyle("background-color",this.options.maskColor);
		this.bmask.setOpacity(0.4);
		//drag,resize function
				var pcord=this.parent.getCoordinates();
		var onc=function(el){return function(){el.updateDims()}};
		var bstartresize=function(el){
			return function(){
				var xlimit=el.parent.offsetWidth- el.selEl.offsetLeft;
				var ylimit=el.parent.offsetHeight- el.selEl.offsetTop;
				this.options.limit={x:[0,xlimit],y:[0,ylimit]};
			};
		};
		this.selEl.makeDraggable({onDrag:onc(this),
								  onComplete:onc(this),
								  container:"lwrap_"+ this.id
								  });	
		this.selEl.makeResizable({handle:'resizec_'+ this.id,
								  onBeforeStart:bstartresize(this),
								  onDrag:onc(this),
								  onComplete:onc(this)
								  });
	},								
	/*
	 * Function:updateDims
	 * Updates the dimmensions of the cropper
	 */
	updateDims:function(){
		var parentWidth=parseInt($("lwrap_"+ this.id).getStyle("width"));
		var parentHeight=parseInt($("lwrap_"+ this.id).getStyle("height"));
		//set top mask dimmensions
		this.tmask.style.height=this.selEl.style.top.toInt() + "px";
		this.tmask.width=parentWidth+ "px";
		//set left mask dimmensions
		this.lmask.style.height=this.selEl.style.height;
		this.lmask.style.width=this.selEl.style.left;
		this.lmask.style.top=this.selEl.style.top
		//set right mask dimmensions		
		this.rmask.setStyle("height",parseInt(this.selEl.getStyle("height"))+ "px");
		this.rmask.setStyle("width",(parentWidth-parseInt(this.selEl.getStyle("left"))-parseInt(this.selEl.getStyle("width")))+ "px");		
		this.rmask.style.top=this.selEl.style.top
		this.rmask.style.left=parseInt(this.selEl.style.left) + parseInt(this.selEl.style.width)+ "px";
		//set bottom mask dimmesions
		this.bmask.setStyle("height",(parentHeight-this.selEl.getStyle("height").toInt()-this.selEl.getStyle("top").toInt())+ "px");
		this.bmask.setStyle("width",parentWidth+ "px");
		this.bmask.style.top=parseInt(this.selEl.style.top)+parseInt(this.selEl.style.height) + "px";
		//update Details
		recrio.ui.setCropperDetails(this.selEl.style.left,this.selEl.style.top,this.selEl.style.width,this.selEl.style.height);
	
	},
	/*
	 * Function:getSize
	 * Returns the coordinates of the selection area
	 */
	getSize:function(){
		var rval={width: this.selEl.style.width,
			  height: this.selEl.style.height,
			  top: this.selEl.style.top,
			  left: this.selEl.style.left
			  };
		return rval;
	},
	/*
	 * Function: remove
	 * Removes the current selection including all elements
	 */
	remove:function(){
		this.selEl.remove();
		this.rmask.remove();
		this.lmask.remove();
		this.bmask.remove();
		this.tmask.remove();
	}
	
	
});