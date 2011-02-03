var UI=new Class({
	initialize:function(options){
		this.parent=options.parent;
		this.loading=new Image();
		this.loading.src="/images/loading.gif";
		this.timg=new Image();
		this.croppers=new Array();
		this.addEvents();
		this.draggatize();
		this.setInitHid();
		this.setPos();
		this.curDetails="none";
		this.colorpicker=new MooRainbow('cpicker', {
			wheel: true,
			onChange: function(color) {
				recrio.setColor(color);
			},
			onComplete: function(color) {
				recrio.setColor(color);
			}
		});

	},
	/*Function: AddEvents
	 * Adds all the necessary events to the DOM elements
	 */
		addEvents:function(){
			$("submenu").addEvent("mouseleave",function(){
				new Fx.Style("submenu",'opacity').start(1,0);
			});
			var children=$("menuMain").getChildren();
			children.each(function(el){
				if(el.id!="cpicker"){
						$(el).addEvent("mouseover",function(event){
							var event=new Event(event);
							var name=el.id.split("_");
							recrio.ui.showSub(name[0]);
						});
						}
				
			}		
			);
			
		},
		
		/*
		 * Function addImg
		 * adds a new image layer to the canvas
		 * Parameters:
		 * src- url of the image to add
		 * el - the layer id
		 */
		addImg:function(src,el){
			var temp=new Image();
			temp.src=src;
			$("workspace").innerHTML=$("workspace").innerHTML +'<div id="lwrap_' + el + '" class="layer" style="overflow:hidden;"><img id="layer_' + el + '"src="' + src + '"/><image id="resize_' + el + '"class="resize" src="/images/resize.png"/><div id="loader_' + el + '" class="loading"><img src="/images/loader.gif"/></div></div>';
				$("layer_"+ el).setStyle("width",this.width + "px");
				$("layer_"+ el).setStyle("height",this.height+ "px");
				$("lwrap_"+ el).setStyle("width",this.width+ "px");
				$("lwrap_"+ el).setStyle("height",this.height+ "px");
				$("loader_"+ el).setStyle("height",this.height+ "px");
				$("loader_"+ el).setStyle("width",this.width+ "px");
				$("loader_"+ el).setOpacity(0);
				recrio.ui.getFocus(el);
				recrio.ui.draggatize();
				recrio.ui.showLayerInfo();
		},
		/*
		 * Function addText
		 * Adds a new text layer to the canvas
		 * Parameters:
		 * id - the id of the layer to be added
		 */
		addText:function(el){
			var layer=this.parent.getLayer(el);
			$("workspace").innerHTML+='<div id="lwrap_' + el + '" class="layer"><div id="layer_' + el + '">' + layer.getValue() +'</div><image id="resize_' + el + '"class="resize" src="/images/resize.png"/></div>';
		    var domEl=$("layer_" + el);
			this.updateLayer(el,layer.options);
			this.draggatize();
		},
		/*
		 * Function: reload
		 * reloads a given layer if it's an ImgLayer
		 * Parameters:
		 * id - the id of the layer to be reloaded
		 *  
		 */
		reload:function(id){
			if(this.parent.isImg(id)){	
				var el=id;
				this.showLoad(id);
				var layer=this.parent.getLayer(id);
				var dom=$("layer_" + id);
				var wrap=$("lwrap_"+ id);
				var temp=new Image();
				temp.src=layer.getSrc();
				temp.onload=function(){
					dom.src=this.src;
					dom.setStyle("width",temp.width+"px");
					dom.setStyle("height",temp.height+"px");
					wrap.setStyle("width",temp.width+"px");
					wrap.setStyle("height",temp.height+"px");
					recrio.ui.hideLoad(el);
					recrio.ui.draggatize();
					recrio.ui.showLayerInfo();
					recrio.ui.showLayerHist(id);
				}
			}
			
		},
		/*
		 * Function: createOSlider
		 * Creates the opacity slider
		 * Parameters:
		 * val- the starting value for the opacity, defaults to 100
		 */
		createOSlider: function(val){
				var op=($defined(val))?val:1;
				this.slider=new Slider("track",
						   "handle",
						   {onChange:recrio.ui.setOpacity,
						    onComplete:recrio.ui.setOpacity,
						    steps:100
						   });
				this.slider.set(op*100);
		},

		/*
		 * Function: draggatize
		 * allows all needed layers to be available for dragging.
		 */
		draggatize:function(){
			var ond=function(i){return function(){recrio.ui.resizeLayer(i)}};
			var onc=function(i){return function(){recrio.ui.trueResizeLayer(i)}};
			for(var i=0;i<this.parent.getNumLayers();i++){
			    if($("layer_"+i)){
					$("lwrap_"+ i).makeResizable({handle:'resize_'+i,onStart:function(){recrio.ui.showDetails("resize");},onDrag:ond(i),onComplete:onc(i)});
					$("lwrap_"+ i).makeDraggable({handle:'layer_'+i});					
					}
			}
			$("dialog").makeDraggable({handle:'dTitle'});
			$("layer_pane").makeDraggable({handle:'layerTitle'});
			$("text_pane").makeDraggable({handle:'textTitle'});
			$("toolPane").makeDraggable({handle:'toolTitle'});
			$("errorPane").makeDraggable();
			$("welcome").makeDraggable();
			$("filterDetails").makeDraggable();
		},
		/*
		 * Function: setInitHid
		 * sets the initial hidden elements
		 */
		setInitHid:function(){
			$("submenu").setOpacity(0);
			$("history").setStyle("display","none");
			$("imgfx").setStyle("display","none");
			$("dialog").setOpacity(0);
			$("errorPane").setOpacity(0);
			$("filterDetails").setOpacity(0);
		},
		/*
		 * Function: resizeLayer
		 * resizes the contents of the given layer to fit the wrapper
		 * Parameters:
		 * id - the id of the layer to be resized
		 */
		resizeLayer:function(id){
			var wrapper=$("lwrap_" + id);
			var layer=$("layer_" + id);
			layer.setStyle("width", wrapper.getStyle("width").toInt());
			layer.setStyle("height",wrapper.getStyle("height").toInt());
			if(!$("nheight") || !$("nwidth")) return false;
			$("nheight").value=wrapper.getStyle("height");
			$("nwidth").value=wrapper.getStyle("width");
		},
		/*
		 * Function: trueResizeLayer
		 * resizes the given layer to fit the DOM element by applying the resize filter on the object.
		 * Parameters:
		 * id - the id of the layer to be resized
		 */
		trueResizeLayer:function(id){
			if(this.parent.isImg(id)){	
				var el=id;
				var layer=this.parent.getLayer(id);
				var dom=$("layer_" + id);
				layer.apply("resize",parseInt(dom.getStyle("width")) + ',' + parseInt(dom.getStyle("height")));
				this.reload(el);
			}
			
		},
		/*
		 * Function: showLoad
		 * shows loading screen on a given layer
		 * Parameters:
		 * id - the id of the layer
		 */
		showLoad:function(id){
			var wrap=$("lwrap_" + id);
			var loader=$("loader_"+ id);
			loader.setStyle("width",wrap.getStyle("width"));
			loader.setStyle("height",wrap.getStyle("height"));
			new Fx.Style("loader_" + id,'opacity').start(0,1);
			
		},
		
		/*
		 * Function: hideLoad
		 * removes the loading screen from a layer
		 * Parameters:
		 * id - the id of the layer
		 */
		hideLoad:function(id){
			new Fx.Style("loader_" + id,'opacity').start(1,0);
		},
						
		/*
		 * Function: showTab
		 * Displays the given tab, hiding the other tabs sharing the pane
		 * Parameters:
		 * tab - tab to switch tab to
		 */
		showTab:function(tab){
			if(tab=="text" || tab=="imgfx"){
				$("text_tab").removeClass("tabFocused");
				$("image_tab").removeClass("tabFocused");
				$("text").setStyle("display","none");
				$("imgfx").setStyle("display","none");
				$(tab).setStyle("display","block");
				var tabname=(tab=="imgfx")?"image_tab":"text_tab";
				$(tabname).addClass("tabFocused");
			}else{
				$("hist_tab").removeClass("tabFocused");
				$("layer_tab").removeClass("tabFocused");
				$("history").setStyle("display","none");
				$("layers").setStyle("display","none");
				var tabname=(tab=="history")?"hist_tab":"layer_tab";
				$(tabname).addClass("tabFocused");
				$(tab).setStyle("display","block");
			}
		},
		/*
		 * Function: showSub
		 * shows the corresponding submenu for the given action
		 * Parameters:
		 * action- the action for which to show the submenu
		 */
		showSub:function (action){
			new Ajax("/editor/" + action,{update:'submenu',method:'get',onComplete:function(){
				new Fx.Style("submenu",'opacity').start(0,1);
				$("submenu").innerHTML+='<img src="/images/subbot.png" style="margin-left:-4px"/>';
			}}).request();
			
		},
		/*
		 * Function: hideSub
		 * Hides the submenu
		 */
		hideSub:function(){
			new Fx.Style("submenu",'opacity').start(1,0);
		},
		/*
		 * Function: getFocus
		 * gives the given layer focus
		 * Parameters:
		 * layer-the given layer to be focused
		 */
		getFocus:function(layer){
			this.clearFocus();
			this.showLayerInfo();
			this.showLayerHist(layer);
			var lobj=this.parent.getLayer(layer);
			if($("lwrap_"+ layer)){
				this.parent.slayer=layer;
				$("lwrap_" + layer).addClass("layer_active")
				$("litem_" + layer).addClass("itemFocused");
				if(this.parent.isImg(layer)){
					this.showTab("imgfx");
					
				}else
				{
					this.updateTextPane(layer);
					this.showTab("text");
					
				}
			this.createOSlider(this.parent.getLayer(layer).opacity);
			}
		},
		/*
		 * Function: clearFocus
		 * Clears the focus from all the layers
		 * 
		 */
		clearFocus:function(){
			for(var i=0;i<this.parent.getNumLayers();i++){
				if($("lwrap_"+i) && $("litem_"+i)){
					$("lwrap_" + i).setProperty("class","layer");
					$("litem_" + i).setProperty("class","item");					
				}

			}
		},
		/*
		 * Function:removeLayer
		 * Removes the Dom element of the layer with the given id
		 * Parameters:
		 * id - the id of the layer to remove
		 */
		removeLayer:function(id){
			if($("lwrap_"+ id)){
				$("lwrap_" + id).remove();
				this.showLayerInfo();
				if(this.parent.slayer==id){
					var focus="";
					for(var i=id;i>0;i--){
						if($("lwrap_")+ i) focus=i;
					}
					this.getFocus(focus);
				}
				}
		},
		
		/*
		 * Function:showDig
		 * shows a dialog window with the given action
		 * Parameters:
		 * action - the url of the action to be called
		 * title - the title of the dialog window
		 */
		showDig:function(action,title){
			$("dTitle").innerHTML=title;
			new Ajax("/editor/" + action,{update:'dContent',method:'get',onComplete:function(){
				var myFx = new Fx.Style('dialog', 'opacity').start(0,1);
			}}).request();			
		},
		/*
		 * Function: fadeEl
		 * Fades a DOM element out
		 * Parameters:
		 * el - the element to fade
		 */
		fadeEl:function(el){
			new Fx.Style(el,'opacity').start(1,0);
		},
		/*
		 * Function: showLayerInfo
		 * Updates the layers pane to show all the current layers
		 */
		showLayerInfo:function(){
			$("layerslist").innerHTML="";
			var layers=this.parent.getLayers();
			layers.each(function(layer,index){
				if($("lwrap_"+ index)){
					var vis=(layer.isHidden())?"hide.png":"show.png";
					var typ=(layer.isImg())?"imgicon.png":"texticon.png";
					var cls=(this.parent.slayer==index)?"item_focused":"item";
					$("layerslist").innerHTML+='<li class="' + cls +'" id="litem_' + index + '" onclick="recrio.getFocus(' + index + ')"><img src="/images/' + typ + '"/>' + layer.name.substr(0,10) + '<img src="/images/delete.png" alt="Delete" onclick="recrio.removeLayer(' + index + ');"/><img src="/images/' + vis + '" onclick="recrio.toggleVis(' + index +')" alt="Visibility"/></li>';
			}});
		},
		/*
		 * Function: showLayerHist
		 * Updates imginfo with the history of a given layer
		 * Parameters:
		 * id - an array of the history;
		 */
		showLayerHist:function(id){
			var layer=this.parent.getLayer(id);
			$("imgtitle").innerHTML=layer.name.substr(0,10);
			if(layer.isImg()){
				var history=layer.getHistory();
				$("imginfo").innerHTML="";
				for(var i=0;i<history.length;i++){
					$("imginfo").innerHTML+='<li class="item">'+ history[i].split("=")[0] +'<img src="/images/delete.png" alt="Delete" onclick="recrio.deleteHist(' + id + ',' + i +')"/></li>';
				}
			}
		},
		/*Function: updateLayer
		 * Updates the given text layer with the values from the form
		 * Parameters:
		 * id - the id of the layer to update
		 * 
		 */
		updateLayer:function(id,options){
			var layer=$("layer_"+ id);
			layer.innerHTML=options.value;
			layer.setStyle("font-family",options.font);
			layer.setStyle("font-size",options.size + "pt");
			layer.setStyle("font-style",options.style);
			layer.setStyle("font-weight",options.weight);
			layer.setStyle("color",options.color);
			this.showLayerInfo();
		},
		/*
		 * Function:setOpacity
		 * sets the Opacity of the selected layer
		 * Parameters:
		 * op - the desired opacity, a number between 0-100
		 */
		setOpacity:function(op){
			layer=$("layer_" + recrio.slayer);
			if(layer){
				layer.setOpacity(op/100);
				recrio.getLayer(recrio.slayer).setOpacity(op/100);
			}
		},
		/*
		 * Function: flattenLayers
		 * Flattens all the visible layers
		 */
		flattenLayers:function(){
			var filters=new Array();
			var layers=this.parent.getLayers();
			var basenum=this.parent.getBaseLayer();
			var base=layers[basenum];
			var rel_x=parseInt($("lwrap_" + basenum).getStyle("left"));
			var rel_y=parseInt($("lwrap_" + basenum).getStyle("top"));
			for(var i=1;i<layers.length;i++){
				var el=layers[i];
				if($("lwrap_"+ i) && !el.isHidden()){
					var x=parseInt($("lwrap_"+ i).getStyle("left"))- rel_x;
					var y=parseInt($("lwrap_"+ i).getStyle("top"))- rel_y;
					if(!el.isImg()){
						var rgb=($("layer_" + i).style.color.substr(4,$("layer_" + i).style.color.length-2)).split(",");
						filters[filters.length]=new Array('addtext',x + "," + y + "," +el.size + "," + el.font + "," +rgb[0] + "," + rgb[1] + "," + parseInt(rgb[2]) + "," + el.opacity + ',' + el.style +  ','+  el.weight + ',' + escape(el.value));
					}else{
						filters[filters.length]=new Array('composite',encode64(layers[i].getSrc())+ ","+ x + "," + y + ',' + el.opacity);
					}
					$("lwrap_"+ i).remove();
				}			
			}
			base.applyMult(filters);
			this.reload(basenum);
			this.getFocus(basenum);
		},
		/*
		 * Function:hideLayer
		 * hides the Dom of a layer
		 * Parameters:
		 * id - the layer id
		 */
		hideLayer:function(id){
			$("lwrap_"+ id).setStyle("display","none");
		},
		/*
		 * Function:showLayer
		 * hides the Dom of a layer
		 * Parameters:
		 * id - the layer id
		 */
		showLayer:function(id){
			$("lwrap_"+ id).setStyle("display","block");
		},
		/*
		 * Function updateColor
		 * Sets the current color
		 * Parameters:
		 * color - a color object
		 */
		updateColor:function(color){
			$("cpicker").setStyle("background-color",color.hex);
			var layer=$("layer_" + this.parent.slayer);
			if(layer){
				layer.setStyle("color",color.hex);
			}

		},
		/*
		 * Function:updateTextPane
		 * Updates the text panel with the given text layer's properties
		 * Parameters:
		 * id - the given text layer's id
		 */
		updateTextPane:function(id){
			var layer=this.parent.getLayer(id);
			$("fontValue").value=layer.value;
			this.setSelected(layer.size,"fontSize");
			this.setSelected(layer.font,"fontFace");
			this.setSelected(layer.weight,"fontWeight");
			this.setSelected(layer.style,"fontStyle");
			this.colorpicker.manualSet(layer.color,"hex");
			$("cpicker").setStyle("background",layer.color);
			
		},
		/*
		 * Function:setSelected
		 * Sets the selected index of the given dropdown to the given value
		 * Parameters:
		 * value - the value to select
		 * dropdown - the id of the dropdown to select
		 */
		setSelected:function(value,dropdown){
			var d=$(dropdown);
			for(var i=0;i<d.length;i++){
				if(d.options[i].value==value){
					d.selectedIndex=i;
				}
			}
			
		},
		/*
		 * Function: setPos
		 * Set the position of the panels
		 */
		setPos:function(){
			$("layer_pane").setStyle("left",window.getWidth()-250 + "px");
			$("layer_pane").setStyle("top","200px");
			$("text_pane").setStyle("left",window.getWidth()-250 + "px");
			$("text_pane").setStyle("top","450px");
			$("welcome").setStyle("top","200px");
			$("welcome").setStyle("left",(window.getWidth().toInt()-402)/2);
			$("toolPane").setStyle("left","0px");
			$("toolPane").setStyle("top","300px");
		},
		/*
		 * Function createCrop
		 * Creates a cropper on a given layer
		 * Parameters:
		 * id- the id of the layer to create the cropper on
		 */
		createCrop:function(id){
			this.croppers[id]=new Cropper(id,{initWidth:'100',initHeight:'50'});
		},
		/*
		 * Function showDetails
		 * loads the given action details in the menuDetails div
		 * Parameters:
		 * action - the action name
		 */
		showDetails:function(action){
			if(action==this.curDetails) return false;
			new Ajax("/editor/" + action +"Details",{update:'menuDetails'}).request();
			this.curDetails=action;
		},
		/*
		 * Function setCropperDetails
		 * sets the appropriate input fields with the given values
		 * Parameters:
		 * x - the x coordinate
		 * y - the y coordinate
		 * width - the width
		 * height - the height
		 */
		setCropperDetails:function(x,y,width,height){
			if(!$("cWidth") || !$("cHeight")){
				return false;
			}
			$("cWidth").value=width.toInt();
			$("cHeight").value=height.toInt();
			
		},
		/*
		 * Function: showError
		 * Shows an error pane containing the given message
		 */
		showError:function(msg){
			var cont=$("errorPane");
			$("errorMain").setText(msg);
			var x=(window.getWidth().toInt()-cont.getStyle("width").toInt())/2 +"px";
			var y=(window.getHeight().toInt()-cont.getStyle("height").toInt())/2 +"px";
			cont.setStyle("left",x);
			cont.setStyle("top",y);
			var myFx = new Fx.Style('errorPane', 'opacity').start(0,1);				
		},
		/*
		 * Function:hideError
		 * hides the Error dialog
		 */
		hideError:function(){
			var myFx = new Fx.Style('errorPane', 'opacity').start(1,0);	
		},
		
		/*
		 * Function: showWelcome
		 * shows the Welcome screen
		 */
		showWelcome:function(){
			$("welcome").setStyle("display","block");
			var myFx = new Fx.Style('welcome', 'opacity').start(0,1);	
		},
		/*
		 * Function:showFiltDetails
		 * shows the filter details pane
		 */
		showFiltDetails:function(){
			//crappy way of doign it, gotta fix this
			$("previewOpt").setHTML("");
			var myFx = new Fx.Style('filterDetails', 'opacity').start(0,1);
		},
		/*
		 * Function:hideFiltDetails
		 * hides the filter details pane
		 */
		hideFiltDetails:function(){
			this.fadeEl('filterDetails');
		}
	
});