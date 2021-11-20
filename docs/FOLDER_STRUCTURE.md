## Folder structure ##

´´´bash
.
+--.circleci                   # CI/CD scripts
+--composer                    # Docker container images (TODO: rename to containers)
+--db                          # Database related files
|  +--migrations               # Database migrations
|  +--seeds                    # Database seeds
|
+--docs                        # Documentations files
+--node_modules
+--globals                     # Global singleton imports
+--scripts                     # Store executables and procedures
+--src
|  +--controllers
|  +--middlewares
|  +--errors
|  +--routes
|  +--utils
|  +--services
|
+--.env
+--.gitignore
+--config.ini                  # Store app settings
+--machine.ini                 # (Optional) overwrite config.ini values
+--cluster.js
+--server.js                   # Entrypointer
+--knexfile.js                 # Knex CLI entrypoint/configuration file
+--nodemon.json                # Nodemon configuration file
+--package.json                # NPM package manager file
+--package-lock.json           # NPM cache file
+--pm2.json                    # PM2 process manager configuration file
+--watcher.js                  # Watchdog script
+--docker-build.sh
+--docker-run.sh
+--Dockerfile
+--Dockerfile.yml
´´´