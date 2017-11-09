---
layout: page
title: Push debug profiler
---

Sandstone integrates a development tool, the push debug profiler.

It logs all messages that has been sent to the websocket server
during call to the rest api.

<img
    src="img/push-debug-profiler-screen.png"
    alt="Push debug profiler screenschot"
    class="img-fluid"
/>


## Enable the push debug profiler

Just register the profiler by adding:

``` php
$app->register(new Eole\Sandstone\Push\Debug\PushServerProfilerServiceProvider());
```

where `$app` is your Sandstone instance.

{:data-level="info"}
> **Note**:
> It assumes you have
> [installed the Symfony profiler](https://github.com/silexphp/Silex-WebProfiler)
> in your Silex installation.


## Usage

Once registered, a "Push" panel should appear in `/_profiler`.

This panel logs all messages with their content, size, event class and event name.

{:data-level="warning"}
> **Note**:
> Just refreshing an old panel won't work.
> You must make a new request, then open it in with the profiler
> to see the "Push" panel.

Another note: There is no icon for the Push panel, I didn't find one, so if you have an idea... :D
