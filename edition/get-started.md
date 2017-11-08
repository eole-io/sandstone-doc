---
layout: page
title: Sandstone Edition
---

<h2 class="no-margin-top">Installation</h2>

Sandstone requires PHP 5.6+, ZMQ and php-zmq extension.

But the edition also has a Docker installation,
so you don't need to install PHP, ZMQ, php-zmq, mysql... but Docker.


### Normal installation

This requires PHP 5.6+, ZMQ, php-zmq extension, composer, and a database.

You may need to [install ZMQ and php-zmq on Linux]({{ site.baseurl }}/install-zmq-php-linux.html).


#### Install a new Sandstone project

``` bash
composer create-project eole/sandstone-edition
cd sandstone-edition/
```

 - Create a database for your project.
 - Configure your environment in `config/environment-dev.php`.
 - Run `php bin/console orm:schema-tool:create` to initialize the database schema.

Run the websocket server with:

``` bash
php bin\websocket-server
```

Then go to the diagnostic page: `http://localhost/sandstone-edition/www/hello/world.html`

<i class="fa fa-check" aria-hidden="true"></i> The installation is done.

Access to the **Silex console**:

``` bash
php bin/console
```

#### Other links

> I will assume here that your webserver point to your application root with:
>
> `http://localhost/sandstone-edition/www/`

You should also access to:

 - `http://localhost/sandstone-edition/www/index-dev.php/api/hello` *hello world* route in **dev** mode.
 - `http://localhost/sandstone-edition/www/api/hello` *hello world* route in **prod** mode.
 - `http://localhost/sandstone-edition/www/index-dev.php/_profiler/` Symfony web profiler (only dev mode).
 - `ws://localhost:8482` Websocket server.


### Docker installation


This installation requires **make**, **Docker** and **docker-compose**.

``` bash
# Install a new Sandstone project
curl -L https://github.com/eole-io/sandstone-edition/archive/dev.tar.gz | tar xz
cd sandstone-edition-dev/

# Install and mount environment
make
```

*See [About Makefile](#about-makefile) section to learn more about Makefile commands.*

> **Note**: Sometimes you'll need to do either a
> `chown -R {your_user}:{your_group} .`
> or a
> `chmod -R 777 var/*`
> to make it work.

> ![Raspberry Pi](raspberrypi.png)
> **Note**: There is also an ARMv7 environment
> to mount Sandstone on Raspberry Pi.
>
> Copy docker/docker-compose.arm.yml to docker-compose.override.yml
> to use arm docker images:
>
> `cp docker/docker-compose.arm.yml docker-compose.override.yml`
>
> Or if you already have a docker-compose.override.yml,
> change all images with the ones in `docker/docker-compose.arm.yml`.

Then check your installation by going to the diagnostic page: http://0.0.0.0:8480/hello/world.html

:heavy_check_mark: The installation is done.

Docker runs the whole environment, the RestApi, the websocket server and PHPMyAdmin. You now have access to:

 - <http://0.0.0.0:8480/hello/world.html> Diagnostic page.
 - <http://0.0.0.0:8480/index-dev.php/api/hello> *hello world* route in **dev** mode.
 - <http://0.0.0.0:8480/api/hello> *hello world* route in **prod** mode.
 - <http://0.0.0.0:8480/index-dev.php/_profiler/> Symfony web profiler (only dev mode).
 - <http://0.0.0.0:8481> PHPMyAdmin (login: `root` / `root`).
 - `ws://0.0.0.0:8482` Websocket server.

You can now start to create your RestApi endpoints and websocket topics.

Access to the **Silex console**:

``` bash
docker exec -ti sandstone-php /bin/bash -c "php bin/console"
```

Open a bash session to PHP Docker container:

``` bash
make bash
```

#### Docker default ports

Once the environment mounted, Docker exposes by default these ports:

 - `8480:http` Web server for the RestApi (nginx)
 - `8481:http` PHPMyAdmin instance
 - `8482:ws` Websocket server
