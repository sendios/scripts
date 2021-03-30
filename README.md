<p align="center">
    <a href="https://github.com/sendios" target="_blank">
        <img src="https://avatars2.githubusercontent.com/u/16989772?s=200&v=4" height="100px">
    </a>
</p>

# Sendios scripts

  - [Usage](https://github.com/sendios/scripts/tree/version3#usage)
  - [Webpush (FCM)](https://github.com/sendios/scripts/tree/version3#webpush-fcm)
  - [Webpush (GCM)](https://github.com/sendios/scripts/tree/version3#webpush-gcm)
  - [Attaching Email to push user](https://github.com/sendios/scripts/tree/version3#attaching-email-to-push-user)

<p></p>

## Usage
#### 1. Include scripts on website 

```html
 <script>
 (function (w, d, f) {
       w[f] = function () {(w[f].q = w[f].q || []).push(arguments)};
       w['_mf_object_name'] = f;
       var l = document.createElement('script');
       l.src = 'https://scripts3.sendios.io/build/widget/latest.js';
       l.type = 'text/javascript';
       l.async = true;
       var s = d.getElementsByTagName('script')[0];
       s.parentNode.insertBefore(l, s);
  })(window, document, 'mf');

  mf.project = 1; // <- (Required) Your project ID  
  mf.msgSenderId = "1"; // <- (Required) Unique sender id for your project. Note: string, not int
  mf.sw = '/sw.js'; // <- (Required) Your service worker here
  mf.email = 'test@gmail.com'; //  <- User email. If you know
</script>
```

##### `mf` object format

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>project</code></td>
<td><code>int</code></td>
<td><strong>Required.</strong> Your project id in <a href="https://admin.sendios.io/account/projects" rel="nofollow">sendios system</a>  </td>
</tr>
<tr>
<td><code>email</code></td>
<td><code>string</code></td>
<td><strong>Optional.</strong>  User email </td>
</tr>
<tr>
<td><code>msgSenderId</code></td>
<td><code>int</code></td>
<td><strong>Required when using FCM messaging</strong> sender id from <a href="https://firebase.google.com/docs/cloud-messaging/" target="_blank">FCM</a> </td>
</tr>
<tr>
<td><code>sw</code></td>
<td><code>string</code></td>
<td><strong>Required</strong> path to your service worker</td>
</tr>
<tr>
<td><code>pushPopupShowCallback</code></td>
<td><code>function</code></td>
<td><strong>Optional</strong> Function that would be called before any subscription popup was shown</td>
</tr>
</tbody></table>

## Webpush (FCM)

#### 2. Add our gcm_sender_id to manifest.json
If you don't have it - create in top level and add to head: 
```html
<link rel="manifest" href="/manifest.json">
```

Content in file manifest.json:
```json
{
  "gcm_sender_id": "103953800507"
}
```

Don't confuse the "browser sender ID" with the project-specific sender ID value shown in your Firebase project settings. The browser sender ID for manifest.json is a fixed value, common among all FCM JavaScript clients.

### Register your service worker
If you don't have it - create in top level in file  /sw.js

```html
<script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/path-to-service-worker.js');
    }
</script>
```

#### 3. Add our functions to service worker

```js
self.addEventListener('push', function (event) {
  let msg = event.data.json();
  let notificationTitle, notificationContent, notificationId;

  if (msg && msg.hasOwnProperty('notification')) {
    msg.notification.data = msg.data;
    if (msg.data.requireInteraction) {
      msg.notification.requireInteraction = true
    }
    if (msg.data.image) {
      msg.notification.image = msg.data.image;
    }
    msg.notification.data.url = msg.notification.click_action;

    notificationTitle = msg.notification.title;
    notificationContent = msg.notification;
    notificationId = msg.data.id;
  } else {
    msg = msg ? msg : JSON.parse(event.data.text());
    msg.data = msg;
    notificationTitle = msg.title;
    notificationContent = msg;
    notificationId = msg.id;
  }

  event.waitUntil(self.registration.showNotification(notificationTitle, notificationContent));
  // Track open
  fetch('https://tracking.sendios.io/v1/webpush/show/' + notificationId, {
    method: 'post'
  })
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Show page
  event.waitUntil(
    clients
      .matchAll({
        type: 'window'
      })
      .then(function() {
        return clients.openWindow(event.notification.data.url)
      })
  );
  // Track click
  fetch('https://tracking.sendios.io/v1/webpush/click/' + event.notification.data.id, {
    method: 'post'
  })
});
```

### Init subscription in your js code 
```html
mfWorker('webpushfcm', 'subscribe');
```
You can provide callback function 3-rd parameter for accept/deny push subscription info


## Webpush (GCM)

#### Add our gcm_sender_id to manifest.json 
```json
{
  "gcm_sender_id": "413413089701"
}
```
Including manifest.json in `<head>` block of website 

```html
<link rel="manifest" href="/manifest.json">
```
### Register your service worker
```html
<script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/path-to-service-worker.js');
    }
</script>
```
#### Add our functions to service worker

```js
self.addEventListener('push', function (event) {
    const options = JSON.parse(event.data.text());
    options.data = options;
    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
    // Track open
    fetch('https://tracking.sendios.io/v1/webpush/show/' + options.id, {
        method: "post"
    });
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    // Show page
    event.waitUntil(
        clients.matchAll({
            type: "window"
        }).then(function () {
            return clients.openWindow(event.notification.data.url);
        })
    );
    // Track click
    fetch('https://tracking.sendios.io/v1/webpush/click/' + event.notification.data.id, {
        method: "post"
    });
});
```

### Run in your code 

```js
mfWorker('webpushgcm', method, callback = null, time = 3000)
```

* `method` - One of the formats:
  * `init` -  Show popup widget from sendios system
  * `subscribe` - Show default webpush subscribe popup
- `callback` - Function that will be called when user accept/deny push subscription default: `null`
- `time` - Popup showing timeout default: `3000 ms`

## Attaching Email to push user

### Run in your code 

```js
window.mfWorker.attachEmailToPushUser( email )
```

* `email` - User email that would be attached to current push user. 
