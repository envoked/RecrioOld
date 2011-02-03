class BlogsController < ApplicationController
   before_filter :authenticate_admin, :except=>["all","view","login","authenticate","feed"]
  layout"site", :except=>["feed"]
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list
    @blog_pages, @blogs = paginate :blogs, :per_page => 10
  end

  def show
    @blog = Blog.find(params[:id])
  end

  def new
    @blog = Blog.new
  end

  def create
    @blog = Blog.new(params[:blog])
    @blog["date"]=Time.new.to_i
    if @blog.save
      flash[:notice] = 'Blog was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end

  def edit
    @blog = Blog.find(params[:id])
  end

  def update
    @blog = Blog.find(params[:id])
    if @blog.update_attributes(params[:blog])
      flash[:notice] = 'Blog was successfully updated.'
      redirect_to :action => 'show', :id => @blog
    else
      render :action => 'edit'
    end
  end

  def destroy
    Blog.find(params[:id]).destroy
    redirect_to :action => 'list'
  end
  
  def all
    @blogs=Blog.find(:all,:order=>["date DESC"])
  end
  
  def view
    @blog=Blog.find(params[:id])
    @comments=Comments.find(:all,:conditions=>["blog_id=?",params[:id]],:order=>["date Desc"])
  end
  
  def authenticate_admin
    unless session[:admin]
      session["return_to"] = @request.request_uri
      redirect_to :action=>"login"
      return false
    end
    return true
  end
  
  def authenticate
    if params[:user]=="adrian" && params[:password]=="102287sr" then
      session[:admin]="1"
      redirect_to_path(session[:return_to])
    end
  end
  
  def login
    
  end
 def feed
  @blogs =Blog.find(:all,:order=>["date DESC"],:limit=>10);
 end
end
