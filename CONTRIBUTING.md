Contributing
============

The documentation is open for contributors pull requests or issues.

This is a jekyll project.

Pages are at the root folder, written in markdown (`*.md`).

There is also full examples pages in `examples/`.


## Installation

``` bash
git clone git@github.com:eole-io/sandstone-doc.git
cd sandstone-doc/
```


## Preview

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

You need write access to publish,
and it'll ask for a third party access token.

Using docker:

Run:

``` bash
make publish
```

Or from raw installation:

Full publish documentation script (from a blank folder):
see [docker/jekyll/publish.sh](docker/jekyll/publish.sh) as an example.
