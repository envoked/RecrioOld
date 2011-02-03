/*
 * Class: customDetails
 * creates the Window and preview for tweaking certain filters
 * Arguments:
 * layer - the layer that will be affected
 * filter - the filter for this details screen
 */
var customDetails=new Class({
	initialize:function(layer,filter){
		this.src=layer.src;
		this.hist=["crop=0,0,100,100"].merge(layer.hist);
		this.filterName=filter;
		this.parent=$("previewOpt");
		this.loadData();
	},
	/*
	 * Function: loadData
	 * loads the filter data to create the preview image
	 */
	loadData:function(){
		var request= new Json.Remote('/javascripts/filterData.js',{method:'get',
			onComplete: function(filter){
				this.options.parent.setData(filter);
				this.options.parent.findFilter();
				this.options.parent.createSliders();
				this.options.parent.addButtons();
				this.options.parent.reload();
			},parent:this
		}).send();
	},
	/*
	 * Function: setData
	 * sets the filter data
	 */
	setData:function(filter){
		this.filtInfo=filter.filters;
	},
	/*Function: findFilter
	 * finds and returns the given filter
	 */
	findFilter:function(){
		for(var i=0;i<this.filtInfo.length;i++){
			if(this.filtInfo[i].name==this.filterName.capitalize()){
				return this.filtInfo[i];
			}
		}

	},
	/*
	 * Function: createSliders
	 * Creates the sliders needed for this filter
	 */
	createSliders:function(){
		var filter=this.findFilter(this.filterName);
		for(var i=0;i<filter.parameters.length;i++){
			var parameter=filter.parameters[i];
			new detailSlider(this.parent,parameter.name,parameter.min,parameter.max,{parent:this});
		}
	},
	/*
	 * Function: addButtons
	 * Adds the go and cancel button
	 */
	addButtons:function(){
		var goBut=new Element('input',{'class':'button','value':'Apply','type':'button'});
		var cancelBut=new Element('input',{'class':'button','value':'Cancel','type':'button'});
		cancelBut.addEvent('click',function(){recrio.ui.hideFiltDetails();});
		goBut.injectInside(this.parent);
		cancelBut.injectInside(this.parent);
	},
	/*
	 * Function: reload
	 * Reload the preview image
	 */
	reload:function(){
		var params="?img=" + encode64(this.src);
		for(var i=0;i<(this.hist.length);i++){
			var prfx=(i<10)?"0" + i:i;
			params+="&" + prfx +this.hist[i];
		};
		params+="&" + this.getFilterVal();
		$("previewImg").src="http://recrio.net/editor/edit" + params;
	},
	/*
	 * Function: getFilterVal
	 * Returns the string in the form FilterName=val1,val2,...
	 */
	getFilterVal:function(){
		var val=this.filterName +"=";
		var filter=this.findFilter(this.filterName);
		for(var i=0;i<filter.parameters.length;i++){
			var el="value_" +filter.parameters[i].name;
			if($(el)){
				var comma=(i<1)?"":",";
				val+= comma +$(el).innerHTML;
			}
		}
		return val;
	}
	
});