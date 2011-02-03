var Recreo= new Class({
		initialize: function(options){
			this.options=options;
			hist=new Array();
			layers=new Array();
			if(this.options.color){
				scolor=options.color;
			} else this.scolor=$RGB(00,00,00);
			this.initElem();
			//preload loading image
			this.loading=new Image();
			this.debug=true;
			this.loading.src="/images/loading.gif";
			//initiate color picker
			this.picker=new MooRainbow('color',
										{'startColor':[0,0,0],
										 onChange:this.setColor,
										 onComplete:this.setColor });
			//opacity slider
			this.slider=new Slider("otrack",
								   "ohandle",
								   {onChange:this.setOpacity,
								    onComplete:this.setOpacity,
								    steps:100
								   });
			//DEBUGGER
			this.debugf=(this.options.debug)?true:false;
			this.resizables=new Array();
			new Fx.Style('submenu', 'opacity').set(0);
			$('submenu').addEvent("mouseleave",function(){new Fx.Style('submenu', 'opacity').start(1,0);});
			this.addEvents();
				
		},
		//Add all button events
		addEvents:function(){
			var children=$("tools").getChildren();
			children.each(function(el){
				if(el.id!="" && el.id!="color" && $(el).hasClass("button")){
						$(el).addEvent("mouseover",function(event){
							var event=new Event(event);
							var name=el.id.split("_");
							recreo.showSub(name[0],event.page.y);
						});
						}
				
			});

		},
		//initiate elements
		initElem: function(){
			this.draggatize();
			$('dialog').setStyle('top','100px');
			$("layersdiv").setStyle('right'),'0px';
			$("layersdiv").setStyle('top'),'400px';
			$('dialog').setStyle('left','100px');
			$('layersdiv').setStyle('display','none');
		},
		//add text
		addText: function(){
			var el=layers.length;
			$("workspace").innerHTML+='<div id="lwrap_' + el + '" class="lwrap"><div id="layer_' + el+'">Enter Text</div><image id="lhandle_' + el + '"class="lhandle" src="/images/resize.png"/></div>';
			layers[layers.length]=new Text({font:$("fontFace").value,
													  size:$("fontSize").value,
													  color:scolor,
													  value:$("layer_"+el).innerHTML,
													  name:$("layer_"+el).innerHTML,
													  opacity:100
													});
			this.getFocus(el);
			$("layer_"+el).style.color=scolor.hex;
			$("layer_"+el).setStyle('font-size',$("fontSize").value + "pt");
			this.draggatize();
			this.showLayerInfo();
			this.slider.set(100);
		
		},
		//add Img
		addImg:function(src){
			elnum=layers.length;
			var tp=new Image();
			tp.src=src;
			layers[elnum]=new ImgLayer({
										src:src,
										name:src.split('/')[src.split('/').length-1]
			});
			tp.onload=function(){
				$("workspace").innerHTML+='<div id="lwrap_' + elnum + '" class="lwrap"><img id="layer_' + elnum + '"src="' + src + '"/><image id="lhandle_' + elnum + '"class="lhandle" src="/images/resize.png"/></div>';
				$("layer_"+ elnum).setStyle("width",tp.width);
				$("layer_"+ elnum).setStyle("height",tp.height);
				$("lwrap_"+ elnum).setStyle("width",tp.width);
				$("lwrap_"+ elnum).setStyle("height",tp.height);
				recreo.getFocus(elnum);
				recreo.draggatize();
				recreo.showLayerInfo();
			}
			
		},
		//add Filter
		addFilter:function(filter){
			var selected=$("slayer").value;
			if($("all").getValue()=="true"){
				this.apply(filter);
			}else{
				if(layers[selected].type=="image"){
					layers[selected].apply(filter);
					var temp=new Image();
					temp.src=layers[selected].getSrc();
					temp.onload=function(){
					$("layer_"+ selected).src=temp.src;
					$("layer_"+ selected).setStyle("width",temp.width);
					$("layer_"+ selected).setStyle("height",temp.height);
					$("lwrap_"+ selected).setStyle("width",temp.width);
					$("lwrap_"+ selected).setStyle("height",temp.height);						
					}	
				}
			}
			
			
		},
		//apply filter
		apply: function(filter,values){
			//ensure that filter isn't null
			if(filter.length>0){
				if(values!=undefined){
					hist[hist.length]=filter +"="+ values;
				}else{
					hist[hist.length]=filter;
				} 
			}			
			//create the parameters string
			var params="?img=" + this.srcs[0];
			for(var i=0;i<(hist.length);i++){
				params+="&" + i +hist[i];
			}
			this.updateImg(params);
			this.showHistory();
			//alert(params);
			
		
		},
		//apply multiple
		applyMult:function(filters){
			for(var x=0;x<filters.length;x++){
				if(filters[x].length>1){
					hist[hist.length]=filters[x][0] +"="+ filters[x][1];
				}else{
				hist[hist.length]=filters[x][0];
				} 	
			}
			//alert(hist[hist.length-1]);
			//create the parameters string
			var params="?img=" + this.srcs[0];
			for(var i=0;i<(hist.length);i++){
				params+="&" + i +hist[i];
			}
			//alert(params);
			this.updateImg(params);
			this.showHistory();
		},
		
		//clear all layer focus
		clearFocus: function(){
			for(var i=0;i<layers.length;i++){
				if($defined($("layer_"+ i).innerHTML)){
					$("layer_"+ i).style.border="0px"}
			}
			//reset slider
			this.slider.set(100);
		},
		
		
		//debug
		debug: function(value){
			if(this.debugf==true)$("debugger").innerHTML+=value+"<br/>";
		},
				
		//make all needed elements draggable
		draggatize:function(){
			$('dialog').makeDraggable({handle:'dialog_title'});
			$('tools').makeDraggable();
			$('tabpanel').makeDraggable({handle:'tabtitle'});
			$('textpanel').makeDraggable({handle:'text_title'});
			//draggatize text
			for(var i=0;i<layers.length;i++){
			    if($("layer_"+i)){
					
					$("lwrap_"+ i).makeResizable({handle:'lhandle_'+i,onDrag:this.resizeImg,onComplete:this.trueResizeImg,preserveRatio:true});
					$("lwrap_"+ i).makeDraggable({handle:'layer_'+i});					
					}
				
			}
		
		},
		///resize all images to size of wrapper
		resizeImg:function(i){
			for(var i=0;i<layers.length;i++){
				if($("lwrap_" + i) && $("layer_"+ i)){
					 $("layer_"+ i).setStyle('width',$("lwrap_" + i).getStyle('width'));
					 $("layer_"+ i).setStyle('height',$("lwrap_" + i).getStyle('height'));
				}
			}
		},
		//truly resize all images
		trueResizeImg:function(){
			for(var i=0;i<layers.length;i++){
				//check if elements exists, if it's an image, if the dimmensions are diffeen
				if($("lwrap_" + i) && $("layer_"+ i)&&  layers[i].type=="image" && layers[i].getWidth()!=$("layer_" + i).getStyle("width")){
					//apply resize to layer
					layers[i].apply("resize",parseInt($("layer_" + i).getStyle("width")) + ',' + parseInt($("layer_" + i).getStyle("height")));
					var temp=new Image();
					var el=i;
					temp.src=layers[i].getSrc();
					temp.onload=function(){
					$("layer_"+ el).src=temp.src;
					$("layer_"+ el).setStyle("width",temp.width);
					$("layer_"+ el).setStyle("height",temp.height);
					$("lwrap_"+ el).setStyle("width",temp.width);
					$("lwrap_"+ el).setStyle("height",temp.height);						
					}					
				}
			}			
			
		},
		
		//get focus
		getFocus:function(layer){
			this.clearFocus();
			$("slayer").value=layer;
			$("layer_" +layer).style.border="1px solid #333333";
			if(layers[layer].type=="text"){
				this.showPane("text_pane");
				$("textValue").value=layers[layer].getValue();
			}
			else{
				this.showPane("image_pane");
				
			}
		},
		//load an image from the web
		openWeb: function(url){
			var temp=new Image();
			layers[0]=new ImgLayer({src:url, name:'background'});
			temp.src=url;
			$("layer_0").src=url;
			$("layer_0").style.width=temp.width + "px";
			$("layer_0").style.height=temp.height+ "px";
			//reset hist
			hist=new Array();
			hist=new Array();
			this.showHistory();
		
		},
		//flatten text layers
		flattenLayers: function(){
			var filters=new Array();
			for(var z=0;z<layers.length;z++){
				var element=$("lwrap_" + z);
				if(element){			
					var x=parseInt(element.style.left)-parseInt($("layer_0").style.left);
					var y=parseInt(element.style.top)-parseInt($("layer_0").style.top);
					var el=layers[z];
					if(el.type=="text"){
						var rgb=(element.style.color.substr(4,element.style.color.length-2)).split(",");
						filters[filters.length]=new Array('addtext',x + "," + y + "," +el.size + "," + el.font + "," +rgb[0] + "," + rgb[1] + "," + parseInt(rgb[2]) + "," + el.opacity/100 + ','+ escape(el.value));
					}else{
						
						filters[filters.length]=new Array('composite',encode64(layers[z].getSrc())+ ","+ x + "," + y + ',' + el.opacity);
					}
					$("lwrap_"+ z).remove();
				}
			}
			this.applyMult(filters);
			this.showLayerInfo();
		},
		//get correspoding measurement for ratio
		getCorMes: function(which){
			if($("ratio").getValue()!="1") return false;
			if(which=="height")$("width").setProperty("value",this.getRWidth($("height").getValue()));
			else
			$("height").setProperty("value",this.getRHeight($("width").getValue()));
		
		},
		//hide element
		hideEl:function(el){
			if($(el)) $(el).setStyle('display',"none");
		},
		
		//check if given layer is a text layer
		isText:function(num){
			return (layers[num].type=="text");
		},
		//check if the given layer is an image layer
		isImg:function(num){
			return (layers[num].type=="image");
		},
		
		//remove layer
		removeLayer:function(num){
			$("lwrap_"+ num).remove();
			layers.splice(num,1);
			this.showLayerInfo();
		},				
		//select tab
		switchTab: function(tab){
			$('layersdiv').setStyle('display','none');
			$('history').setStyle('display','none');
			$(tab).setStyle('display','block');
						this.slider=new Slider("otrack",
								   "ohandle",
								   {onChange:this.setOpacity,
								    onComplete:this.setOpacity,
								    steps:100,
								   });
						this.slider.set(100);
		},
		
		//set Color
		setColor: function(ncolor){
			scolor=ncolor;
			$('color').setStyle('background-color',ncolor.hex);
			el="layer_" + $("slayer").value;
			if( $(el) && layers[$("slayer").value].type=="text")
			$(el).setStyle("color",ncolor.hex);
		},
		
		//show Dialog
		showDig: function(file){
			$('dialog').setStyle('display','block');
			new Ajax("/editor/" + file,{update:'dialog_main',method:'get'}).request();			
		},
		
		//show load
		showLoad: function(i){
			$("layer_" + i).style.width=this.loading.width + "px";
			$("layer_" + i).style.height=this.loading.width + "px";
			$("layer_" + i).src=this.loading.src;
		},
		//show pane
		showPane: function(pane){
			$("image_pane").setStyle('display','none');
			$("text_pane").setStyle('display','none');
			$(pane).setStyle('display','block');
			
		},
		//show Sub
		showSub:function(name,y){
			var req=new Ajax("/editor/" + name,{update:'submenu',method:'get',onComplete:function(){		
			$("submenu").setStyle('top',y +"px");
			var ef=new Fx.Style('submenu', 'opacity').start(0,1);}
			});
			req.request();
		},
		//undo last action
		undoLast: function(){
			hist.splice(hist.length-1,1);
			this.apply("","");
		},
		
		//Set Layer opacity
		setOpacity:function(op){
			selected=$("slayer").getValue();
			if($("layer_"+ selected)){
				layers[selected].setOpacity(op/100)
				$("layer_"+ selected).setOpacity(op/100);
				}
				},		
		//show hist
		showHistory:function(){
			$("history").innerHTML="";
			for(var i=0;i<hist.length;i++){
				$("history").innerHTML+='<li class="histl">' + hist[i].split('=')[0]+ '<img src="/images/delete.png" style="margin-top:2px;" onclick="recreo.undoStep(' + i + ')"/></li>';
			}
		
		
		},
		//show layer info
		showLayerInfo: function(){
			$("layers").innerHTML="";
			for(var i=0;i<layers.length;i++){
				if($("layer_"+ i))
				$("layers").innerHTML+='<li class="histl"><font onclick="recreo.getFocus(' + i + ')">' + layers[i].name +'</font <img src="/images/delete.png" onclick="recreo.removeLayer(' + i +')"/></li>';
			}
		
		},
		
		//undo given step
		undoStep: function(id){
			hist.splice(id,1);
			this.apply("","");
			this.showHistory();
		},
		
		//update img with given parameters
		updateImg: function(params){
			this.showLoad(0);
			var tempimg=new Image();
			tempimg.src="/editor/edit" + params;
			tempimg.onload=function(){
				$("layer_0").setStyle("width",tempimg.width +"px");
				$("layer_0").setStyle("height",tempimg.height +"px");
				$("layer_0").src=tempimg.src;
			
			}
		},
		
		//update text
		updateText: function(){
			var selected="layer_" + $("slayer").value;
			if($(selected)){
				$(selected).style.fontSize=$("fontSize").value + "pt";
				$(selected).innerHTML=$("textValue").value;
				$(selected).style.color=scolor.hex
				layers[$("slayer").value].setValue($("textValue").value);
				layers[$("slayer").value].setName($("textValue").value);
				layers[$("slayer").value].size=$("fontSize").value+"pt";
			this.showLayerInfo();
			}	
		},
		//get aspect Ratio
		getRatio: function(){
			return parseFloat($("bglayer").getStyle('height'))/ parseInt($("bglayer").getStyle('width'));		
		},
		//get Ratio Width for given height
		getRWidth: function(height){
			return parseInt(height*this.getRatio());
		},
		//get corresponding height for given width
		getRHeight: function(width){
			return parseInt(width / this.getRatio());
		}
		
		

		




});




//layers
var Layer=new Class({
	//initialize object
	initialize: function(options){
		this.opacity=(options.opacity)?options.opacity:1;
		this.type=options.type;
		this.name=options.name;
	},
	setOpacity:function(op){
		this.opacity=op;
	},
	setName:function(name){
		this.name=name;
	}

});

//Text Class
var Text=Layer.extend({
	//initalize product
	initialize: function(options){
		options.type="text";
		this.parent(options);
		this.font=(options.font)? options.font : "arial";
		this.size=(options.size)? options.size : "18pt";
		this.color=(options.color)? options.color : "#000000";
		this.value=(options.value)? options.value : "";
	},
	getValue:function(){
		return this.value;
	},
	setValue:function(val){
		this.value=val;
	}
});
//Image Layer
var ImgLayer=Layer.extend({
	initialize:function(options){
		options.type="image";
		this.parent(options);
		this.src=options.src;
		this.cursrc=this.src;
		this.img=new Image();
		this.img.src=this.src;
		this.hist=$A();
	},
	//apply filter
	apply:function(name,value){
		if(value)
		this.hist[this.hist.length]=name + "=" + value;
		else
		this.hist[this.hist.length]=name;
		//create the parameters string
		var params="?img=" + this.src;
		for(var i=0;i<(this.hist.length);i++){
			params+="&" + i +this.hist[i];
		};
		this.updateImg(params);	
	},
	//update Img
	updateImg:function(params){
		var temp=new Image();
		var comp=new Image();
		temp.src="/editor/edit" + params;
		this.cursrc=temp.src;
		this.img.src=temp.src;
		
	},
	//get SRC
	getSrc:function(){
		return this.cursrc;
	},
	//get Width
	getWidth:function(){
		return this.img.width;
	},
	getHeight:function(){
		return this.img.height;
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


