class EditorController < ApplicationController
require 'RMagick'
require 'open-uri'
  
  def edit
    @img=RImage.new(params['img'])
      @hash=params.sort
       @hash.each do|key,value|
      key=key[2..key.length-1]
       if (@img.methods.include? key) then
         if value.nil?
           @img.send(key.to_sym)
         else
           @img.send(key.to_sym,*value.split(','))
         end
         @img.fblob(@img.display)
       end
      end

    send_data @img.display,:type => "image/jpeg",:disposition=>'inline'
    GC.start
  end
  
  def newimg
   @@newcolor=params["color"]
    @img=Magick::Image.new(params["width"].to_i,params["height"].to_i){self.background_color=@@newcolor}
    
  send_data  @img.to_blob{self.format="PNG"},:type => "image/png",:disposition=>'inline'
  end
  
  def upload_img
   @ctype=@params["img"].content_type.to_s.strip
   if  @ctype.include?("jpeg") then 
     @imge="jpg"
   elsif  @ctype.include?("gif") then
     @imge="gif"
   elsif  @ctype.include?("png")then
     @imge="png"
   end
   
   @file_name=Time.now.to_i.to_s + "." + @imge
   File.open("public/tmpimg/" + @file_name, "wb") { |f| f.write(@params['img'].read) }
  end
  
  def save
    @img=Magick::Image.read(Base64.decode64(params["url"]))
    @@format=params["format"]
    send_data  @img[0].to_blob{self.format=@@format.upcase},:type => "image/" + params["format"], :filename=>params["name"] + "." + params["format"]
    
  end
  
  def errlog
    @err=Time.now.to_i.to_s + " " + params["msg"] + " Url:" + params["url"] + " at line:" + params["line"] +"\n"
    @f=File.open("log/jscript.log","a")
    @f.write(@err)
  end
  
  def isfile
    @fname=Base64.decode64(params["url"])
    @response="true"
    begin
     open(@fname)
    rescue Errno::ENOENT
      @response="false"
    end
  end
  
  def index
    @add=(params["url"])?"recrio.addImg('" + params["url"] +"');":"recrio.ui.showWelcome();"
  end
end
