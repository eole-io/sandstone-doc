---
layout: page
title: Sandstone Edition Cookbook
---

Once you [installed a fresh edition of Sandstone]({{ site.baseurl }}/edition/get-started),
you can start to build your real-time RestApi.

That means creating API endpoints, websocket topics...


### Creating an API endpoint

As Sandstone extends Silex, just create a controller class and a method, then mount it with Silex.

Also, this edition allows to use **annotations** for routing.

{% include file-title.html filename="src/App/Controller/HelloController.php" %}

``` php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use DDesrosiers\SilexAnnotations\Annotations as SLX;
use Alcalyn\SerializableApiResponse\ApiResponse;

/**
 * @SLX\Controller(prefix="/api")
 */
class HelloController
{
    /**
     * Test endpoint which returns a hello world.
     *
     * @SLX\Route(
     *      @SLX\Request(method="GET", uri="hello/{name}"),
     *      @SLX\Value(variable="name", default="world")
     * )
     *
     * @param string $name
     *
     * @return ApiResponse
     */
    public function getHello($name)
    {
        $result = [
            'hello' => $name,
        ];

        return new ApiResponse($result, Response::HTTP_OK);
    }
}
```

> **Note**: Using `ApiResponse` allows to make your controllers return a non-yet-serialized object
> (see [alcalyn/serializable-api-response](https://github.com/alcalyn/serializable-api-response)).
>
> Sandstone transforms the `ApiResponse` to a Symfony `Response` only at the very end, after serialization.

*Related documentation*:

 - [danadesrosiers/Silex annotations](https://github.com/danadesrosiers/silex-annotation-provider)
 - [Silex routing](http://silex.sensiolabs.org/doc/2.0/usage.html#routing)
 - [ApiResponse](https://github.com/alcalyn/serializable-api-response)

### Creating a websocket topic

A websocket topic is like a "category", or a "channel" of communication.
It allows to listen to messages from a same "channel",
without receiving all others messages from the websocket server.

Technically, each topic has its own `Topic` class,
which contains its own logic.

Under Sandstone, a topic has a name (i.e `chat/general`) and can be declared like a route.

#### Creating the topic class

{% include file-title.html filename="src/App/Topic/ChatTopic.php" %}

``` php
namespace App\Topic;

use Ratchet\Wamp\WampConnection;
use Eole\Sandstone\Websocket\Topic;

class ChatTopic extends Topic
{
    /**
     * Broadcast message to each subscribing client.
     *
     * {@InheritDoc}
     */
    public function onPublish(WampConnection $conn, $topic, $event)
    {
        $this->broadcast([
            'message' => $event,
        ]);
    }
}
```

#### Register the topic

{% include file-title.html filename="src/App/AppWebsocketProvider.php" %}

``` php
use App\Topic\ChatTopic;

    public function register(Container $app)
    {
        $app->topic('chat/{channel}', function ($topicPattern) {
            return new ChatTopic($topicPattern);
        });
    }
```

Then you can now subscribe to `chat/general`, `chat/private`, `chat/whatever`, ...

Sandstone `Topic` class extends `Ratchet\Wamp\Topic`,
which is based on Wamp protocol.

Note that you can use all Silex route configuration like:

``` php
$this
    ->topic('chat/{channel}', function ($topicPattern) {
        return new ChatTopic($topicPattern);
    })
    ->value('channel', 'general')                   // Set a default channel name in case someone subscribes to `chat`
    ->assert('channel', '[a-z]')                    // Add constraint on channel name, only lowercases
    ->convert('channel', function () { /* ... */ }) // Add a converter on channel name
;
```

{:data-level="warning"}
> **Note**: You can't use `->method('get')` or `->requireHttps()` for a topic route ;)

#### Retrieve route arguments from topic name

In case your topic name is something like `chat/{channel}`
and you need to pass the `{channel}` argument to your Topic class:

``` php
$this->topic('chat/{channel}', function ($topicPattern, $arguments) {
    $channelName = $arguments['channel'];

    return new ChatTopic($topicPattern, $channelName);
});
```

*Related documentation*:

 - Silex routing: [http://silex.sensiolabs.org/doc/2.0/usage.html](http://silex.sensiolabs.org/doc/2.0/usage.html).
 - Wamp protocol implementation on RatchetPHP: [http://socketo.me/docs/wamp](http://socketo.me/docs/wamp).
 - Wamp protocol: [http://wamp-proto.org/](http://wamp-proto.org/).


### Send a Push event from RestApi to a websocket topic

Sometimes you'll want to notify websocket clients when the RestApi state changes
(a new resource has been PUT or POSTed, or a resource has been PATCHed...).

Then this part is for you.

The logic here is to dispatch an event from the controller behind i.e `postArticle`,
then this event will be forwarded (i.e redisptached) over the `WebsocketApplication`.

Then just listen this event from a topic, and do something like broadcast a message...

#### 1. Dispatch event from controller

{% include file-title.html filename="src/App/Controller/HelloController.php" %}

``` php
public function getHello($name)
{
    $this->container['dispatcher']->dispatch(HelloEvent::HELLO, new HelloEvent($name));
}
```

{:data-level="info"}
> **Note**: `$this->container` is passed to your controllers constructors
> if you use the `@SLX\Controller` annotation.

#### 2. Mark the event to be forwarded

{% include file-title.html filename="app/RestApiApplication.php" %}

``` php
use App\Event\HelloEvent;

private function registerUserProviders()
{
    $app->forwardEventToPushServer(HelloEvent::HELLO);
}
```

{:data-level="info"}
> **Note**: This must be done only in RestApi stack.
> If it's done in websocket stack, the event will be redispatched infinitely to itself!

#### 3. Listen the event from a topic

It will listen and receive the event
that has been serialized/deserialized through the Push server,
from the RestApi thread to the websocket server thread.

{% include file-title.html filename="src/App/Topic/ChatTopic.php" %}

``` php
namespace App\Topic;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Ratchet\Wamp\WampConnection;
use Eole\Sandstone\Websocket\Topic;
use App\Event\HelloEvent;

class ChatTopic extends Topic implements EventSubscriberInterface
{
    /**
     * Subscribe to article.created event.
     *
     * {@InheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return [
            HelloEvent::HELLO => 'onHello',
        ];
    }

    /**
     * Article created listener.
     *
     * @param HelloEvent $event
     */
    public function onHello(HelloEvent $event)
    {
        $this->broadcast([
            'message' => 'Someone called api/hello. Hello '.$event->getName(),
        ]);
    }
}
```

{:data-level="info"}
> **Note**: Sandstone automatically subscribes topics (to the EventDispatcher)
> that implement the `Symfony\Component\EventDispatcher\EventSubscriberInterface`.

Up to you to create a `HelloEvent` class and **create serialization metadata**.

{:data-level="warning"}
> **Note**: You need to create serialization metadata for objects that are forwarded.
> It need to be serialized and deserialized around the Push server.

*Related documentation*:

 - [Symfony EventSubscriber](http://symfony.com/doc/current/components/event_dispatcher.html#using-event-subscribers)
 - [Sandstone Topic class]({{ site.baseurl }}/examples/multichannel-chat.html)
 - [Serializer metadata Yaml reference](http://jmsyst.com/libs/serializer/master/reference/yml_reference)


### Doctrine

Sandstone edition integrates Doctrine:

 - Doctrine DBAL and ORM are installed,
 - you can use entities with annotations or yaml mapping, the `orm:schema-tool`...
 - Doctrine commands are available under `php bin/console`
 - Entities serialization is well handled (fixes relations infinite loops). See [serializer-doctrine-proxies](https://github.com/alcalyn/serializer-doctrine-proxies).

#### Creating an entity

Here using annotations.

{% include file-title.html filename="src/App/Entity/Article.php" %}

``` php
namespace App\Entity;

use Doctrine\ORM\Mapping\Entity;

/**
 * @Entity
 */
class Article
{
    /**
     * @var int
     *
     * @Id
     * @Column(type="integer")
     * @GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @Column(type="string")
     */
    private $title;

    /**
     * @var \DateTime
     *
     * @Column(type="datetime")
     */
    private $dateCreated;

    // getters and setters...
}
```

#### Serialization metadata

If your entity is meant to be serialized, which happens in any of these cases:

 - rendered in json (or xml, yml...) to the RestApi user
 - sent to the websocket server from the rest api (forwarded)

{% include file-title.html filename="src/App/Resources/serializer/App.Entity.Article.yml" %}


``` yaml
App\Entity\Article:
    exclusion_policy: NONE
    properties:
        id:
            type: integer
        title:
            type: string
        dateCreated:
            type: DateTime
```

#### Updating the database

Use the Doctrine command:

<div class="language-bash highlighter-rouge"><pre class="command-line" data-prompt="$">
<code class="language-bash">php bin/console orm:schema-tool:update --force</code>
</pre></div>

#### Retrieve Repository from container

``` php
$app['orm.em']->getRepository('App\\Entity\\Article');
```

*Related documentation*:

 - [Serializer available **Types**](http://jmsyst.com/libs/serializer/master/reference/annotations#type) (`string`, `integer`, ...)
 - [Serializer metadata Yaml reference](http://jmsyst.com/libs/serializer/master/reference/yml_reference)
 - [Doctrine available **Types**](http://docs.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/types.html)
 - [Doctrine commands](http://docs.doctrine-project.org/projects/doctrine-orm/en/latest/reference/tools.html)


### Debugging with Symfony web profiler

[Silex web profiler](https://github.com/silexphp/Silex-WebProfiler) is already integrated in Sandstone edition.

It is available under `/index-dev.php/_profiler/`.

It allows you to debug RestApi requests: exceptions, Doctrine queries, called listeners...

Sandstone also provides a [Push message debugger](https://github.com/eole-io/sandstone/releases/tag/1.1.0) (since version `1.1`)
to check which messages has been sent to the websocket stack.


### Cross origin

If your front-end application is **not** hosted under the same domain name
(i.e `http://localhost` for the front-end and `http://localhost:8480` for the RestApi),
then you probably get cross origin errors when trying to query your RestApi using Ajax.

This is a server-side security against XSS attacks.

To fix this issue, you have to configure your RestApi server
to let him send responses to a precise domain name.

The edition integrates [jdesrosiers/silex-cors-provider](https://github.com/jdesrosiers/silex-cors-provider),
so you just have to configure it:

{% include file-title.html filename="config/environment.php" %}

``` php
return [
    'cors' => [
        // only serve `localhost` (if your front-end application is on `localhost`)
        'cors.allowOrigin' => 'http://localhost',

        // or to serve **All clients**
        'cors.allowOrigin' => '*',
    ],
];
```


### About Makefile

The Makefile only works for a Docker installation.

`make`: Used most of the time, install and run the project. Makes containers started.

`make run`: Start containers.

`make bash`: Open a bash session into php container.

`make update`: Use it to update composer dependencies, rebuild and recreate docker containers.

`make logs`: display container logs.

`make restart_websocket_server`: Should be used after the websocket source code changed,
in example when you develop a websocket topic.

`make optimize_autoloader`: Optimize composer autoloader and reduce autoloader execution time by ~80%.
Only use it in prod. Use `make` to remove optimization.

`make book`: Display help (make commands, urls to api, PHPMyAdmin...)

<pre class="command-line" data-prompt="$" data-output="2-999"><code class="language-bash">make book
#
# Default urls:
#  http://0.0.0.0:8480/hello/world.html          Diagnostic page.
#  http://0.0.0.0:8480/index-dev.php/api/hello   *hello world* route in **dev** mode.
#  http://0.0.0.0:8480/api/hello                 *hello world* route in **prod** mode.
#  http://0.0.0.0:8480/index-dev.php/_profiler/  Symfony web profiler (only dev mode).
#  http://0.0.0.0:8481                           PHPMyAdmin (login: `root` / `root`).
#  ws://0.0.0.0:8482                             Websocket server.
#
# Make commands:
#  make                             Install application and run it
#  make run                         Run application
#  make bash                        Enter in php container
#  make logs                        Display containers logs and errors
#  make update                      rebuild containers, update composer dependencies...
#  make restart_websocket_server    Reload websocket stack, i.e when code is updated
#  make book                        Display this help
#
# See Sandstone edition cookbook:
#  https://github.com/eole-io/sandstone-edition
#
# See Sandstone documentation:
#  https://eole-io.github.io/sandstone
#</code></pre>
