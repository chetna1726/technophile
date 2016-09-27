class SessionsController < ApplicationController

  layout 'admin'

  def new
    redirect_to contact_requests_path if session[:admin_id]
  end

  def create
    @admin = Admin.find_by(email: params[:email])
    if @admin && @admin.authenticate(params[:password])
      session[:admin_id] = @admin.id
      redirect_to contact_requests_path, notice: 'You have successfully signed in.'
    else
      redirect_to login_path, alert: 'Error logging in!'
    end
  end

  def destroy
    session[:admin_id] = nil
    redirect_to login_path, notice: 'Logged out successfully.'
  end
end
