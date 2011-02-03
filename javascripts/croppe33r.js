/*
Class: Cropper
 
Note:
	Originally written to allow user to generate custom thumbnails after uploading an image to the server.
	User selects a zone on the picture, and then the coordinates can be sent to the server where the actual image file will be processed.
	I thought it would also be usefull to create highlight zones, like on flickr. It was written for images, but it can be used with div too.
	Still work in progress. I don't think it works if image is inside an overflown element, but it should be easy to fix.
	Tested in Firefox2, Opera9 and IE7. Couldn't test it in Safari yet, don't have a mac. IE uses a hack for now, described in the code.
 
Arguments:
	target - the new object receives the picture element/id.
	options - see Options bellow
 
Options:
	mask - if a mask should be overlayed on the picture, representing the non-selected area. Default is true
	maskColor - string representing the mask's color. Default is #000000
	maskOpacity - the opacity of the mask. Default is 0.3
	borderWidth - Width of the selection border. Default is 2px (you can provide an int or a string 'Xpx', it is convert to int anyway)
	borderStyle - Style of the selection border. Default is dashed
	borderColor - Color of the selection Border. Defautl is #ff0000
	mini - {x,y} minimum size of the selection. Selection will be initialised with this values. Default are 80 pixels wide and high.  (you can provide an int or a string 'Xpx', it is convert to int anyway)
	onComplete - function fired when when stop dragging/resizing. receives four parameters: top,left,width,height.
	resizerWidth - Size of the resizing zone, on left and bottom of selection. Cursor changes when switching from dragging to resizing mode. default is 8px  (you can provide an int or a string 'Xpx', it is convert to int anyway)
	resizable - if the selection can be resized. Default is true
	keepRatio - if aspect ratio must be kept when resizing, depending on the minimum size of the selection. Default is true
 
Exemple:
	var myCropper = new Cropper('myImage', {
		borderWidth: '1px',
		BorderStyle: 'dotted',
		mini: {x:160, y:120},
		onComplete:function(top,left,width,height){
			$('resize_coords').value="top:"+ top +"px, left:"+ left +"px, width:"+ width +"px, height:"+ height +"px";
		}
	});
*/
 
var Cropper = new Class({
 
	options : {
		maskColor:'#000000',
		maskOpacity:0.3,
		mask:true,
		borderWidth:2,
		borderStyle:'dashed',
		borderColor:'#ff0000',
		mini:{x:80,y:80},
		onComplete:Class.empty,
		resizerWidth:8,
		resizable:true,
		keepRatio:true
	},
 
	initialize : function(target,options){
		this.setOptions(options);
		this.target=$(target);
 
		//Generating the new elements. see the functions for more details
		this.buildCropper();
		if(this.options.mask)
		{
			this.buildMask();
		}
 
		//initialize the dragging, using the target element as container, and the selection's dragger as handle
		//On complete we fire the optional function, providing the top, left, width and height of the selection a parameters.
		//Those coordinates are also stored in the object, so you can access them from an external function, like when presing a button to submit a request to the server.
		//On drag we update the mask
		this.drag = new Drag.Move(this.resizer,{
			container:this.target,
			handle:this.dragger,
			onComplete:function(){
				var coord1 = this.resizer.getCoordinates();
				this.top = coord1.top-this.target_coord.top;
				this.left = coord1.left-this.target_coord.left;
				this.width = coord1.width;
				this.height = coord1.height;
				this.fireEvent('onComplete',[this.top,this.left,this.width,this.height]);
			}.bind(this),
			onDrag:function(){
				if(this.options.mask)
				{
					this.updateMask();
				}
			}.bind(this)
		});
 
		//We initializse the resizing object if option resizable is set to true
		if(this.options.resizable)
		{
			//if keepRation is set to true, we initialize a ratio object variable, so we don't have to calculate on every drag event
			if(this.options.keepRatio)
			{
				this.ratio=this.options.mini.x/this.options.mini.y;
			}
			this.resize = this.resizer.makeResizable({
				limit:{
					x:[this.options.mini.x.toInt()-this.margin],
					y:[this.options.mini.y.toInt()-this.margin]
				},
				onComplete:function(){
					//this is just to fix eventual bug, where the selection extends ouside of the element
					this.resize.fireEvent('onDrag');
 
					//Does the same thing as drag onComplete
					this.drag.fireEvent('onComplete');
				}.bind(this),
				onDrag:function(){
					//This is the tricky part. It works, but I got some bugs when stress testing it on the bottom and right borders of the element.
					//I'm sure there is a better way to do that, so feel free to adjust it.
					var coord1=this.resizer.getCoordinates();
					if(this.options.keepRatio)
					{
						this.resizer.setStyle('width',(coord1.height*this.ratio-this.margin).toInt()+'px');
						if(coord1.bottom>this.target_coord.bottom)
						{
							var bound = this.target_coord.bottom-coord1.top;
							this.resizer.setStyles({'width':(bound*this.ratio).toInt()-this.margin+'px','height':bound-this.margin+'px'});
						}
						if(coord1.right>this.target_coord.right)
						{
							var bound = this.target_coord.right-coord1.left;
							this.resizer.setStyles({'width':bound-this.margin+'px','height':(bound/this.ratio).toInt()-this.margin+'px'});
						}
					}
					else
					{
						if(coord1.right>this.target_coord.right)
						{
							var bound = this.target_coord.right-coord1.left-this.margin+'px';
							this.resizer.setStyles({'width':bound,'height':bound});
						}
						if(coord1.bottom>this.target_coord.bottom)
						{
							var bound = this.target_coord.bottom-coord1.top-this.margin+'px';
							this.resizer.setStyles({'width':bound,'height':bound});
						}
					}
					//to update the mask
					this.drag.fireEvent('onDrag');
				}.bind(this)
			});
		}
		if (this.options.initialize) this.options.initialize.call(this);
		return this;
	},
 
	buildCropper : function(){
 
		//a wrapper element is created. it adopts the target element and inherits its margin, padding and boder
		//you may have to edit the wrapper's properties to keep the original look of your page.
		//Just use myCropper.wrapper
		this.wrapper = new Element('div');
		this.wrapper.setStyles({
			margin : this.target.getStyle('margin'),
			padding : this.target.getStyle('padding'),
			border : this.target.getStyle('border')
		});
		this.wrapper.injectAfter(this.target);
		this.wrapper.adopt(this.target);
		this.target.setStyles({
			margin : 0,
			padding : 0,
			border : 0
		});
 
		//get the target element coordinates, will be used a lot. We suppose the element position doesn't change
		this.target_coord=this.target.getCoordinates();
 
		//In our case, it is important that the selection has exactly the dimension we want it to have, because we want to use its coordinates
		//So, because the selection element has a margin and a padding(requiered), we must substract thos values everytime we set the selection width or height
		//we set it once in the object, so we doesn't have to calculate it everytime
		this.margin=2*this.options.borderWidth.toInt() + this.options.resizerWidth.toInt();
 
		//the main selection element,  which will be draggable and resizable, generated from the options. It is centered on the target element
		this.resizer = new Element('div');
		this.resizer.setStyles({
			position:'absolute',
			display:'block',
			border:this.options.borderWidth.toInt() + "px " + this.options.borderStyle + " " + this.options.borderColor,
			width:this.options.mini.x.toInt() - this.margin + "px",
			height:this.options.mini.y.toInt() - this.margin + "px",
			left:(this.target_coord.left+(this.target_coord.width/2)-(this.options.mini.x.toInt()/2)).toInt()+'px',
			top:(this.target_coord.top+(this.target_coord.height/2)-(this.options.mini.y.toInt()/2)).toInt()+'px',
			padding:'0 ' + this.options.resizerWidth.toInt() + 'px ' + this.options.resizerWidth.toInt()+ 'px 0',
			cursor: 'nw-resize'
		});
		this.resizer.injectAfter(this.target);
 
		//The dragger is an element injected inside the selection element. it will be used as  a handle for the Drag.Move object
		this.dragger = new Element('div');
		this.dragger.setStyles({
			display:'block',
			width:'100%',
			height:'100%',
			cursor:'move'
		});
		this.dragger.injectInside(this.resizer);
 
		//IE hack: in IE, an element doesn'tseem to catch mouse events if it has not content and no 'solid' background.
		//So I set a white background with a very low opacity. but problem is the selection boder beocmes transparent too.
		//So if you disable the mask effect, you can't even see it at all.
		//if a css guru knows of another trick, he his welcome.
		if(window.ie)
		{
			this.resizer.setStyle('backgroundColor','#ffffff');
			this.resizer.setOpacity(0.01);
		}
	},
 
	buildMask : function(){
		//to generate the mask, we creat four div, on top, left, right and bottom of the selection
		//The padding and margin are set to 0 just for safety, in case you applied global css rules to all your div elements.
		//I know it's pretty ugly for now and can be optimized.
		this.rezr_coord = this.resizer.getCoordinates();
		this.mask_top = new Element('div');
		this.mask_top.setStyles({
			position:'absolute',
			top:this.target_coord.top+'px',
			left:this.target_coord.left+'px',
			width:this.target_coord.width+'px',
			height:this.rezr_coord.top-this.target_coord.top+'px',
			backgroundColor:this.options.maskColor,
			padding:0,
			margin:0
		});
		this.mask_top.setOpacity(this.options.maskOpacity);
		this.mask_left = new Element('div');
		this.mask_left.setStyles({
			position:'absolute',
			top:this.rezr_coord.top+'px',
			left:this.target_coord.left+'px',
			width:this.rezr_coord.left-this.target_coord.left+'px',
			height:this.rezr_coord.height+'px',
			backgroundColor:this.options.maskColor,
			padding:0,
			margin:0
		});
		this.mask_left.setOpacity(this.options.maskOpacity);
		this.mask_right = new Element('div');
		this.mask_right.setStyles({
			position:'absolute',
			top:this.rezr_coord.top+'px',
			left:this.rezr_coord.right+'px',
			width:this.target_coord.right-this.rezr_coord.right+'px',
			height:this.rezr_coord.height+'px',
			backgroundColor:this.options.maskColor,
			padding:0,
			margin:0
		});
		this.mask_right.setOpacity(this.options.maskOpacity);
		this.mask_bottom = new Element('div');
		this.mask_bottom.setStyles({
			position:'absolute',
			top:this.rezr_coord.bottom+'px',
			left:this.target_coord.left+'px',
			width:this.target_coord.width+'px',
			height:this.target_coord.bottom-this.rezr_coord.bottom+'px',
			backgroundColor:this.options.maskColor,
			padding:0,
			margin:0
		});
		this.mask_bottom.setOpacity(this.options.maskOpacity);
		this.mask_top.injectAfter(this.resizer);
		this.mask_left.injectAfter(this.resizer);
		this.mask_right.injectAfter(this.resizer);
		this.mask_bottom.injectAfter(this.resizer);
	},
 
	updateMask : function(){
		//Made this a function because it's being called when both dragging and resizing
		//it's pretty much doing the same thing as the builder, except it uses refreshed coordinates from the selection
		var coord1=this.resizer.getCoordinates();
		this.mask_top.setStyles({
			top:this.target_coord.top+'px',
			left:this.target_coord.left+'px',
			width:this.target_coord.width+'px',
			height:coord1.top-this.target_coord.top+'px'
		});
		this.mask_left.setStyles({
			top:coord1.top+'px',
			left:this.target_coord.left+'px',
			width:coord1.left-this.target_coord.left+'px',
			height:coord1.height+'px'
		});
		this.mask_right.setStyles({
			top:coord1.top+'px',
			left:coord1.right+'px',
			width:this.target_coord.right-coord1.right+'px',
			height:coord1.height+'px'
		});
		this.mask_bottom.setStyles({
			top:coord1.bottom+'px',
			left:this.target_coord.left+'px',
			width:this.target_coord.width+'px',
			height:this.target_coord.bottom-coord1.bottom+'px'
		});
	}
});
Cropper.implement(new Events, new Options);