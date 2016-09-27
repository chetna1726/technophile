class User < ApplicationRecord
  validates :name, :email, :message, presence: true

  after_commit :notify_admins, on: :create

  private

    def notify_admins
      UserMailer.notify(id).deliver_now
    end
end
