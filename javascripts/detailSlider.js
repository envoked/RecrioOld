/**
 * Class: detailSlider
 * Creates a slider for a given option
 * Arguments:
 * el - the element the slider will be inserted into
 * name - the name of the option to be set
 * min - the minimum value for the option
 * max - the maxinum value for the option
 * options - any extra options
 */
var detailSlider=new Class({
	initialize:function(el,name,min,max,options){
		this.name=name;
		this.steps=(max-min).toInt();
		this.min=min;
		this.max=max;
		this.start=(options.start)?options.start:min;
		this.parent=($type(el)=='string')?$(el):el;
		this.options=options;
		this.addEls();
		var ond=function(pos){$("value_" + this.options.name).setText(pos);
		this.options.parent.options.parent.reload();}
		var onc=function(pos){$("value_" + this.options.name).setText(pos);
		};

		this.slider=new Slider('track_' + this.name, 'handle_' +this.name,{steps:this.steps,onChange:ond,onComplete:ond,name:this.name,min:min,parent:this});
		this.slider.set(min);
	},
	/*
	 * Function: addEls
	 * Adds all the necessary Elements
	 */
	addEls:function(){
		var container=new Element('div',{'class':'hDiv'});
		var width=(this.steps<20)?this.steps*10:this.steps;
		var track=new Element('div',{'styles':{'width': width + 'px','display':'block'}, 'class':'track','id': "track_" +this.name});
		var handle=new Element('div',{ 'class':'handle','id': "handle_" +this.name});
		var nameCont=new Element('div',{ 'class':'info'});
		var valCont=new Element('div',{ 'class':'info','id': "value_" +this.name});
		valCont.setHTML(this.min);
		nameCont.setText(this.name);
		handle.injectInside(track);
		nameCont.injectInside(container);
		track.injectInside(container);
		valCont.injectInside(container);
		container.injectInside($("previewOpt"));
		
	}
});
