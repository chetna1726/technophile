class Admin < ApplicationRecord

  has_secure_password

  validates :name, :email, presence: true
  validates :email, format: /[a-z]+\w*@[a-z]{3,}(.[a-z]{2,5}){1,2}/i, allow_blank: true
  validates :email, uniqueness: { case_sensitive: false }, allow_blank: true

  after_create :send_welcome_mail

  private

    def send_welcome_mail
      AdminMailer.welcome(id).deliver_now
    end
end
