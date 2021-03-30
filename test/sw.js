self.addEventListener('push', function (event) {
    var data = event.data.text();
    data = JSON.parse(data);
    const notificationOptions = {
        body: data.desc,
        icon: data.icon,
        data: data
    };
    // Show push
    event.waitUntil(
        self.registration.showNotification(data.title, notificationOptions)
    );
    // Track open
    fetch('https://api.sendios.io/v1/webpush/show/' + data.id, {
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
    fetch('https://api.sendios.io/v1/webpush/click/' + event.notification.data.id, {
        method: "post"
    });
});
