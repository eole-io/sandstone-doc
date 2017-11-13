Sandstone documentation
=======================

The documentation is built with [Jekyll](http://jekyllrb.com/).

## Contribute

### Installation

``` bash
cd sandstone/doc
bundle install
```


### Preview

Using docker:

``` bash
make
```

Or from raw installation:

``` bash
bundle exec jekyll serve
```

Then go to [http://localhost:4000/sandstone/](http://localhost:4000/sandstone/) (don't forget trailing slash).

It will watch for file changes, so just refresh after your changes.


## Reindex search

Using docker:

First create `docker-compose.override.yml` with content:

``` yml
version: '2'

services:
    jekyll:
        environment:
            ALGOLIA_API_KEY: xxx # My secret key from dashboard
```

Then:

``` bash
make update_search_index
```


## Publish

Using docker:

``` bash
make publish
```

Or from raw installation:

Full publish documentation script (from a blank folder):

``` bash
#!/bin/bash

rm -fr /tmp/sandstone sandstone
git clone git@github.com:eole-io/sandstone.git --branch=dev
cd sandstone/doc
git fetch origin

bundle install
bundle exec jekyll build --destination /tmp/sandstone/
cd ..
git checkout gh-pages
rm -fr *
mv /tmp/sandstone/* .
rm Gemfile Gemfile.lock README.md
git add -A
git commit -m "Publish"
git push origin gh-pages
git checkout dev
cd ..

rm -fr /tmp/sandstone sandstone
```
