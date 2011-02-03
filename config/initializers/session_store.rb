# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_recrio2_session',
  :secret      => 'd79a1181ee73dae822139e07a28327d21632fafb457b2b1917d496b3e5943645f31b2ee4c9d73919f2f1bf5fc57ce1a70f18739b1f66dec6832f393a6def8ab0'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
