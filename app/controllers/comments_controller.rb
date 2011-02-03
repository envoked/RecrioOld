class CommentsController < ApplicationController
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list
    @comments_pages, @comments = paginate :comments, :per_page => 10
  end

  def show
    @comments = Comments.find(params[:id])
  end

  def new
    @comments = Comments.new
  end

  def create
    @comments = Comments.new(params[:comments])
    if @comments.save
      flash[:notice] = 'Comments was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end
  
  def add
    @comment=Comments.new(params["comment"])
    @comment[:ip]=request.remote_ip
    @comment["date"]=Time.new.to_i
    @comment.save
    @comments=Comments.find(:all,:conditions=>["blog_id=?",@comment.blog_id],:order=>"date Desc")
  end
end
