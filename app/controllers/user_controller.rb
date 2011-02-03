class UserController < ApplicationController
  def add
    @user=User.new(params["user"])
    @user.save
  end
end
