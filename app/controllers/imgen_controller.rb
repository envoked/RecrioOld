class ImgenController < ApplicationController
  def gen
    img=RImage.new("http://www.sxc.hu/img/crt_DawnAllynn.jpg")
      params.each do|key,value|
      key=key[1..key.length]
       if (img.methods.include? key) then
         if value.nil?
           img.send(key.to_sym)
         else
           img.send(key.to_sym,*value.split(','))
         end
       
       end
      end

    send_data img.display,:type => "image/jpeg",:disposition=>'inline'
  
  end

  
end
