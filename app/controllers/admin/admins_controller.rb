class Admin::AdminsController < ApplicationController
  layout 'admin'

  before_action :check_for_current_admin
  before_action :load_admin, only: [:show, :edit, :update, :destroy, :disable, :enable]

  def new
    @admin = Admin.new
  end

  def create
    @admin = Admin.new(admin_params)
    if @admin.save
      redirect_to admin_admins_path, notice: "You have successfully created #{@admin.name}."
    else
      render :new
    end
  end

  def index
    @admins = Admin.all.order(:created_at)
  end

  def update
    if @admin.update(admin_params)
      redirect_to admin_admins_path, notice: "You have successfully updated #{@admin.name}."
    else
      render action: 'edit'
    end
  end

  def destroy
    if @admin.destroy
      flash[:notice] = "You have successfully destroyed #{@admin.name}."
    else
      flash[:alert] = "Error updating #{@admin.name}. Please try again."
    end
    redirect_to admin_admins_path
  end

  def disable
    if @admin.disable!
      flash[:notice] = "You have successfully disabled #{@admin.name}."
    else
      flash[:alert] = "Error disabling #{@admin.name}. Please try again."
    end
    redirect_to admin_admins_path
  end

  def enable
    if @admin.enable!
      flash[:notice] = "You have successfully enabled #{@admin.name}."
    else
      flash[:alert] = "Error enabling #{@admin.name}. Please try again."
    end
    redirect_to admin_admins_path
  end

  private

    def check_for_current_admin
      redirect_to login_path, alert: 'Please log in first' unless current_admin
    end

    def load_admin
      @admin = Admin.where(id: params[:id]).first
      unless @admin
        redirect_to admin_admins_path, alert: 'Admin not found!'
      end
    end

    def admin_params
      params.require(:admin).permit(:name, :password, :password_confirmation, :email)
    end
end
