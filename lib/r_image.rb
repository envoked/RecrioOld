class RImage
require 'RMagick'
def initialize(img)
  @img=Magick::Image.read(Base64.decode64(img))
  @img=@img[0]
end

def fblob(blob)
  temp=Magick::Image.from_blob(blob)
  @img=temp[0]
end

def display
  return @img.to_blob{self.format="JPEG"
  self.quality=100
  }
end

def blur(val)
  @img=@img.blur_image(0,val.to_i)
end

def oil_paint(val)
  @img=@img.oil_paint(val.to_i)
end

def negate
  @img=@img.negate
end

def mblur
  @img=@img.motion_blur(6,1,0)
end

def enhance
  @img=@img.enhance
end

def posterize(levels)
  @img=@img.posterize(levels.to_i)
end

def charcoal(amount)
  @img=@img.charcoal(amount.to_i)
end

def solarize(amout)
  @img=@img.solarize
end

def wave(amp,length)
  @img=@img.wave(amp.to_i,length.to_i)
end

def swirl(deg)
  @img=@img.swirl(deg.to_i*10)
end
def resize(width,height)
  @img=@img.resize(width.to_i,height.to_i)
end

def emboss(radius)
  @img=@img.emboss(radius.to_i)
end

def sharpen
  @img=@img.sharpen
end

def edge(radius)
  @img=@img.edge(radius.to_i)
end

def sepia
  @img=@img.sepiatone
end

def sketch
  @img=@img.sketch
end

def desaturate
  @img=@img.quantize(256,Magick::GRAYColorspace)
end

def addtext(x,y,size,font,r,g,b,op,style,weight,text)
  gc=Magick::Draw.new()
  case style
    when "italic"
      style=Magick::ItalicStyle
    when "oblique"
      style=Magick::ObliqueStyle
    else
      style=Magick::NormalStyle
  end
  gc.annotate(@img,@img.columns,@img.rows,x.to_i,y.to_i,text){
    self.font_style=style
    self.font="public/fonts/" + font
    self.fill="rgb(#{r},#{g},#{b})"
    self.pointsize=size.to_i
    self.gravity=Magick::NorthWestGravity
    self.font_weight=weight.to_i
  }
end

def composite(img,x,y,opacity)
  opacity=1-opacity.to_f
  @img.opacity=opacity.to_i
  @img.matte=true
  @simg=Magick::ImageList.new(Base64.decode64(img))
  @simg.opacity=(Magick::TransparentOpacity-Magick::OpaqueOpacity).abs * opacity.to_f
  @img.composite!(@simg,x.to_i,y.to_i,Magick::OverCompositeOp);
end

def rotate(angle)
  @img=@img.rotate(angle.to_i)
end

def crop(x,y,width,height)
  @img=@img.crop(x.to_i,y.to_i,width.to_i,height.to_i)
end

def to_blob
  return @img.to_blob
end

def normalize
  @img=@img.normalize
end




def save(gformat)
  @img.to_blob{self.format=gformat}
end

def contrast(num)
  positive=num.to_i>0
  num.to_i.times{
    @img=@img.contrast(positive)
  }
end

def adjust(b,s,h)
  @img=@img.modulate(b.to_f/100,s.to_f/100,h.to_f/100)
end

end