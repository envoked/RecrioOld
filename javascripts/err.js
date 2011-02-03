/*
 * Class: Err
 * Handles all the javascript errors, logging them on the server
 * Arguments:
 * 		options - See Below
 * Options:
 * parent - the parent object
 */
var Err=new Class({
	initialize:function(options){
		this.parent=options.parent;
	},
	/*
	 * Function: fileExists
	 * Checks whether a file exists or not
	 * Parameters:
	 * url - the URL of the file
	 */
	fileExists:function(url){
		var call= new Ajax("/editor/isfile" ,{method:'get',async:false,data:"url=" + encode64(url)});
		call.request();
		return ($defined(call.response["text"]) && call.response["text"]=="true");
	},
	/*
	 * Function log
	 * logs the given javascript error via an Ajax call
	 * Parameters:
	 * msg - the given message
	 * url - the file that caused the error
	 * line - the line where the error occured
	 */
	log:function(msg,url,line){
		
		var params="msg=" + msg + "&url=" + url +"&line=" + line;
		var call=new Ajax("/editor/errlog",{method:'get',data:params}).request();
		return false;
	}
});