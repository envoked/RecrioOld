var Recrio=new Class({
	initialize:function(options){
		this.options=options;
		this.core=new Core({parent: this});
		this.ui=new UI({parent:this});
		this.err=new Err({parent:this});
		this.scolor=new Color('#000');
		this.slayer=0;
		this.hist=new Array();
		},
	/*
	 * Function getFocus
	 * Sets the focus to a given layer
	 * Parameters:
	 * id - the layer to get focus
	 * See Also:
	 * <UI>
	 */
	getFocus:function(id){
		this.ui.getFocus(id);
	},
	/*
	 * Function: getNumLayers
	 * Returns:
	 * the number of layers present
	 * See Also:
	 * <Core>
	 */
	getNumLayers:function(){
		return this.core.getNumLayers();
	},
	/*
	 * Function: getLayers
	 * Returns:
	 * an Array of all the Layers present
	 */
	getLayers:function(){
		return this.core.layers;
	},
	/*
	 * Function: isHidden
	 * Checks whether a given layer is hidden or not
	 * Parameters:
	 * id - the id of the id
	 * Returns:
	 * True if it is, false if it's not
	 */
	isHidden:function(id){
		return this.core.layers[id].isHidden();
	},
	/*
	 * Function: updateText
	 * Updates the given text layer with the given parameters;
	 * Parameters:
	 * id -the layer id
	 * options - the list of parameters to be updated
	 */
	updateText:function(id,options){
		if(!this.isImg(id))
		this.getLayer(id).update(options);
	},
	/*
	 * Function: apply
	 * Applies a given filter to a given layer
	 * Parameters:
	 * id - the id of the layer that the filter is applied to
	 * filter - the filter name
	 * value - the values of the filter deliminated by commas
	 */
	apply:function(id,filter,value){
		if(this.isImg(id)){
			this.getLayers()[id].apply(filter,value);
			this.ui.reload(id);;
		}

	},
	/*
	 * Function: applyFocused
	 * Applies the given filter to the focused layer
	 * Parameters:
	 * filter - the filter name
	 * value - the filter value
	 */
	applyFocused:function(filter,value){
		var focused=this.slayer;
		if(this.isImg(focused)){
			this.getLayers()[focused].apply(filter,value);
			this.ui.reload(focused);
		}else{
			this.ui.showError("Sorry but filters can only be applied to images.");
		}
	},
	/*
	 * Function:getLayer
	 * Parameters:
	 * id - the id of the layer to return
	 * Returns:
	 *the layer with the give id
	 */
	getLayer:function(id){
		return this.core.layers[id];
	},
	
	/*
	 * Function: addText
	 * Adds a text layer
	 */
	addText:function(){
		var txt=new Txt({name:"Enter Text",
									   color:this.scolor.hex,
									   font:$("fontFace").value,
									   style:$("fontStyle").value,
									   weight:$("fontWeight").value,
									   size:$("fontSize").value,
									   value:"Enter Text",
									   name :"Enter Text"
									   });
		var el=this.core.addLayer(txt);
		this.ui.addText(el);
		this.ui.getFocus(el);		
	},
	/*
	 * Function: addImg
	 * adds am Img
	 * Parameters:
	 * src- the url of the image
	 */
	addImg:function(src){
		if(true || this.err.fileExists(src)){
			var name=src.split('/');
			el=this.core.addLayer(new ImgLayer({src:src,name:name[name.length-1]}));
			this.ui.addImg(src,el);
		}else{
			this.ui.showError("Sorry, but the image isn't available.");
		}
		
	},
	/*
	 * Function: isImg
	 * Checks whether a given layer is an image
	 * Parameter:
	 * id - the layer id
	 * Returns:
	 * True if it is, false otherwise
	 */
	isImg:function(id){
		return ( this.core.layers[id] && this.core.layers[id].type=="image");
	},
	/*
	 * Function: removeLayer
	 * Deletes the given layer
	 * Parameters:
	 * id - the layer id to delete
	 */
	removeLayer:function(id){
		this.core.removeLayer(id);
		this.ui.removeLayer(id);
	},
	/*
	 * Function: flattenLayers
	 * Flattens all the visible layers
	 */
	flattenLayers:function(){
		this.ui.flattenLayers();
	},
	/*
	 * Function: toggleVis
	 * toggles the vision of a layer
	 * Parameters:
	 * id - the id of the layer
	 */
	toggleVis:function(id){
		var layer=this.getLayer(id);
		if(layer.isHidden()){
			layer.show();
			this.ui.showLayer(id);
		}else{
			layer.hide();
			this.ui.hideLayer(id);
		};
		this.ui.showLayerInfo();	
	},

	/*
	 * Function: deleteHist
	 * Deletes an event from the selected layer's history
	 * Parameters:
	 * id - the id of the history event to delete
	 */
	deleteHist:function(layer,id){
		this.getLayer(layer).undoStep(id);
		this.ui.reload(layer);
	},
	/*
	 * Function:setColor
	 * sets the current color and updates the current layer if it's a text layer
	 * Parameters:
	 * color - the new color object for the color
	 */
	setColor:function(color){
		this.ui.updateColor(color);
		this.scolor=color;
		if(!this.isImg(this.slayer)){
			var layer=this.getLayer(this.slayer);
			layer.update({color:$("layer_" + this.slayer).getStyle("color")});
		}
	},
	/*
	 * Function: updateDLayer
	 * Updates the selected layer with the current parameters
	 */
	updateDLayer:function(){
		//make sure the layer is text
		if (this.isImg(this.slayer)) return false;
		var options={name:$("fontValue").value,
					 color:this.scolor.hex,
					 font:$("fontFace").value,
					 style:$("fontStyle").value,
					 weight:$("fontWeight").value,
					 size:$("fontSize").value,
					 value:$("fontValue").value
									   };		
									   
		this.core.updateLayer(this.slayer,options);
		this.ui.updateLayer(this.slayer,options);
	},
	/*
	 * Function: cropSelected
	 * Creates a cropper on the selected layer
	 */
	cropSelected:function(){
		this.ui.createCrop(this.slayer);
		this.ui.showDetails("crop");
	},
	/*
	 * Function: doCrop
	 * Applies the crop to the selected layer
	 */
	doCrop:function(){
		var cropval=this.ui.croppers[this.slayer].getSize();
		this.applyFocused("crop",cropval.left +"," + cropval.top +"," +
						         cropval.width + "," + cropval.height);
		this.ui.croppers[this.slayer].remove();
	},
	/*
	 * Function: cancelCrop
	 * Removes the current cropper
	 */
	cancelCrop:function(){
		this.ui.croppers[this.slayer].remove();
		this.ui.draggatize();
	},
	/*
	 * Function:reset
	 * Removes all the layers
	 */
	reset:function(){
		for(var i=0;i<layers.getNumLayers;i++){
			this.ui.removeLayer(i);
			this.core.removeLayer(i);
		}
	},
	/*
	 * Function: newBlank
	 * Creates a blank work with the given parameters
	 * Parameters:
	 * width - the width of the new image
	 * height - the height of the new image
	 * color - the background color(white,black,current)
	 */
	newBlank:function(width,height,color){
		var bg=(color=="current")? $("cpicker").getStyle("background-color"):color;
		this.addImg("http://recrio.net/editor/newimg?width=" + width +"&height=" + height  +"&color=" + bg);
	},
	getCorMes: function(which){
		layer=this.getLayer(this.slayer);
		if($("ratio").getValue()!="1") return false;
		if(which=="height")$("nwidth").value=layer.getRWidth($("nheight").value);
		else
		$("nheight").value=layer.getRHeight($("nwidth").value);
	},
	/*
	 * Function: newLayer
	 * Adds a new layer
	 * Parameters:
	 * type - type of layer(text/image)
	 */	
	 newLayer:function(type){
	 	if(type=="text"){
			this.addText();
		}
		else this.ui.showDig('multiSource','Source');
	 },
	 /*
	  * Function : checkSource
	  * Checks the Source of an image in a multiSource Dialog
	  */
	 checkSource:function(form){
	 	if($("imageWeb").value.length>1){
			alert("trrue");
			this.addImg($("imageWeb").value);
			return false;
		}
	 },
	 /*
	  * Function: getBaseLayer
	  * Returns the bottom layer
	  */
	 getBaseLayer:function(){
	 	for(var i=0;i<this.getNumLayers();i++){
			if($("lwrap_"+ i) && !this.isHidden(i)) return i;
		}
	 },
	 /*
	  * Function: save
	  * Saves the current layer
	  */
	 save:function(filename,format){
	 	$("upIform").src="http://recrio.net/editor/save?&url=" + encode64(this.getLayer(this.slayer).getSrc()) + "&name=" + filename + "&format=" +format;
	 },
	/*
	 * Function showFiltDetails
	 * Shows the filter details for a perticular filter
	 * Arguments:
	 * filter - the filter name
	 */
	showFiltDetails:function(filter){
		this.ui.showFiltDetails();
		new customDetails(this.getLayers()[this.slayer],filter);
	}
	
	
});
