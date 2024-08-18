const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.SERVER_PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server, path: '/stream' });

wss.on('connection', (ws) => {
    console.log('Streaming client connected');

    // Open a write stream to save incoming video data
    const fileStream = fs.createWriteStream(path.join(__dirname, 'streamed_video.ts'));

    ws.on('message', (data) => {
        if (data instanceof Buffer) {
            console.log(`Server received chunk of size: ${data.length}`);
            fileStream.write(data);  // Save each chunk of data to the file
        } else {
            console.error('Received non-binary data');
        }
    });

    ws.on('close', () => {
        console.log('Streaming client disconnected');
        fileStream.end();  // End the write stream
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        fileStream.end();  // End the write stream on error
    });
});
