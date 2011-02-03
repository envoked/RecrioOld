class SiteController < ApplicationController
  require 'smtp_tls'
  layout "site", :except=>["adduser","sendmess","index"]
  def index
    
  end
  def adduser
    @user=User.new(params["user"])
    @user["date"]=Time.new.to_i
    @user.save
  end
  
def sendmess
body=params["message"] + " -" + params["email"]
email=params["email"]
subject=params["subject"]?params["subject"]:"Feedback from Site"
@mess =<<END_OF_MESSAGE
From: Concerned User <#{email}>
To: Adrian Wisernig <adrian.wisernig@alvya.com>
Subject: #{subject}

#{body}
END_OF_MESSAGE

    Net::SMTP.start('smtp.gmail.com',25,'gmail.com','contact@alvya.com','tz5X5UbP',:login) do |smtp|
      smtp.send_message @mess, email, 'adrian.wisernig@alvya.com'
    end
  end
end
