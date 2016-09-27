class AdminMailer < ApplicationMailer
  default from: 'info@technophilein.com'

  def welcome(admin_id)
    @admin = Admin.find_by(id: admin_id)
    mail to: @admin.email, subject: 'Welcome to Technophile Infotech!' if @admin
  end
end
