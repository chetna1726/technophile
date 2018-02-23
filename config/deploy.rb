set :stage, 'production'

set :rbenv_type, :user
set :rbenv_ruby, '2.3.0'

set :application, 'campus-drive'
set :repo_url, 'git@github.com:chetna1726/technophile.git'
set :pty, true
set :scm, 'git'
set :deploy_via, :remote_cache
set :rails_env, 'production'

server '18.216.190.218',  user: 'ubuntu', roles: %w(app web db)

set :deploy_to, '/var/www/apps/technophile'
set :branch, 'make-frontend-changes'

set :keep_releases, 5

set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/cable.yml', 'config/secrets.yml')

set :linked_dirs, fetch(:linked_dirs, []).push('log', 'public/system', 'tmp/pids')

set :keep_assets, 2
