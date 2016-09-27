class Admin::UsersController < ApplicationController
  layout 'admin', only: [:index]

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to contact_us_path, notice: 'Thank you for getting in touch! We will get back to you soon! :)'
    else
      flash[:alert] = 'Please provide all required fields.'
      render :new
    end
  end

  def index
    @users = User.all.order(:created_at)
  end

  private

    def user_params
      params.require(:user).permit(:name, :contact_number, :email, :message)
    end
end
