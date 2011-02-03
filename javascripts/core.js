
var Core=new Class({
	initialize:function(options){
		this.parent=options.parent;
		this.layers=new Array();
	},
	/*
	 * Function: addLayer
	 * adds a given layer
	 * Parameters:
	 * layer- a <Layer> Object to be added
	 */
	addLayer:function(layer){
		this.layers[this.layers.length]=layer;
		return this.layers.length-1;
	},
	/*
	 * Function getLayer
	 * gets a given layer
	 * Parameters:
	 * id-the layer number to be returned
	 * Returns:
	 * the corresponding layer object
	 */
	getLayer:function(id){
		return this.layers[id];
	},
	/*
	 * Function: getNumLayers
	 * Returns:
	 * the number of layers
	 */
	getNumLayers:function(){
		return this.layers.length;
	},
	/*
	 * Function apply
	 * Applies a given filter with a given value to a given layer
	 * Parameters:
	 * layer - id of the layer
	 * filter - name of the filter to be applied
	 * value - optional value of the filter to be applied
	 */
	apply:function(layer,filter,value){
		if(this.layers[layer].type=="image")
		this.layers[layer].apply(filter,value);
		return this.layers[layer].getSrc();
	},
	/*
	 * Function isImg
	 * checks whether a given layer is an image layer
	 * Parameters:
	 * id - the id of the layer to be checked
	 * Returns:
	 * True if the layer is an image. False otherwise
	 */
	isImg:function(id){
		return (this.layers[id].type=="image");
	},
	/*
	 * Function: removeLayer
	 * removes a  given layer
	 * Parameters:
	 * id - the id of the layer to be removed
	 */
	removeLayer:function(id){
		this.layers.splice(id,1);
	},
	/*
	 * Function updateLayer
	 * Updates the selected layer with the given parameters
	 */
	updateLayer:function(id,options){
		var layer=this.layers[id];
		//make sure the layer is text
		if (layer.isImg()) return false;
		layer.update(options);
	}	
	
	
	
	
});