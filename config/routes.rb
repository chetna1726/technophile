Rails.application.routes.draw do
  get 'home', to: 'pages#home'
  get 'about-us', to: 'pages#about_us'
  get 'services', to: 'pages#services'
  get 'contact-us', to: 'admin/users#new'
  post 'contact-us', to: 'admin/users#create'
  get 'contact-requests', to: 'admin/users#index'

  namespace :admin do
    resources :admins do
      member do
        patch :disable
        patch :enable
      end
    end
  end

  get 'login', to: 'sessions#new'
  post 'login', to: 'sessions#create'
  delete 'logout', to: 'sessions#destroy'

  root 'pages#home'
end
