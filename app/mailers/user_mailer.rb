class UserMailer < ApplicationMailer
  default from: 'info@technophilein.com'

  def notify(user_id)
    @user = User.find_by(id: user_id)
    mail to: 'info@technophilein.com', subject: 'New Contact Request' if @user
  end
end
