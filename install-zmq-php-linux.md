---
layout: page
title: Install ZMQ and php-zmq extension on Debian or Ubuntu
---

All the required steps to make ZeroMQ 4 work with php7 on Debian or Ubuntu.

This documentation has been strongly inspired from
[http://alexandervn.nl/2012/05/03/install-zeromq-php-ubuntu/](http://alexandervn.nl/2012/05/03/install-zeromq-php-ubuntu/)
(May 2012)
which installs ZeroMQ 2 on Ubuntu 11.10 and php 5.3.

{:data-level="warning"}
> **Note added on October 2017**:
> Obviously, installing php ZMQ extension on PHP 7 and a recent install of Ubuntu
> can be achieved with only:
>
> ``` bash
> sudo apt-get install php-zmq
> ```
>
> So try this before, and if you're lucky, you won't need to follow this procedure.


## Requirements

Make sure you have all the packages:

<pre class="command-line" data-prompt="$" data-output="2-3"><code class="language-bash">sudo apt-get install build-essential libtool autoconf uuid-dev pkg-config git libsodium

## and PHP depending on your version, one of these set of packages:
sudo apt-get install php7.0 php7.0-dev
sudo apt-get install php5 php5-dev
sudo apt-get install php php-dev</code></pre>

{:data-level="warning"}
> **Note**:
> If `libsodium` is not found, try `libsodium-dev`.
> Check [Jonathan Prass Martins' gist](https://gist.github.com/jonathanpmartins/2510f38abee1e65c6d92) to see how to install it.

## Install ZeroMQ

<pre class="command-line" data-prompt="$"><code class="language-bash">wget https://archive.org/download/zeromq_4.1.4/zeromq-4.1.4.tar.gz # Latest tarball on 07/08/2016
tar -xvzf zeromq-4.1.4.tar.gz
cd zeromq-4.1.4
./configure
make
sudo make install
sudo ldconfig</code></pre>

{:data-level="info"}
> **Note**:
> Check the lastest tarball release here:
> [http://download.zeromq.org/#ZeroMQ_4](http://download.zeromq.org/#ZeroMQ_4)


## Installing the PHP binding

<pre class="command-line" data-prompt="$"><code class="language-bash">git clone git://github.com/mkoppanen/php-zmq.git
cd php-zmq
phpize && ./configure
make
sudo make install</code></pre>

Then add the line `extension=zmq.so` in either:

- your php.ini files (apache2 and cli ones)
- or in file `/etc/php/7.0/mods-available/zmq.ini`, then run `sudo phpenmod zmq`

Finally do:

<pre class="command-line" data-prompt="$"><code class="language-bash">sudo service apache2 restart</code></pre>


## Check that it's well installed

Just create a php file in your `www/` folder and add this:

``` php
<?php

var_dump(class_exists('ZMQContext'));
```

And run the file with

<pre class="command-line" data-prompt="$"><code class="language-bash">php my-file.php</code></pre>

you should see `bool(true)` from your browser.

You can also check the installed ZMQ version from `phpinfo()`.
