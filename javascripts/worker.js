// worker.js
self.addEventListener('message', function(e) {
    // Check if the message is to start the optimization
    if (e.data === 'start') {
        // Call the optimize function when the message is received
        self.postMessage('startOptimization');
    }

    if (e.data === 'finish') {
        self.postMessage('finOptimization');
    }
}, false);