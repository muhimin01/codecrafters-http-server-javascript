const net = require("net");
const fs = require("fs");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const url = request.split(' ')[1];
        const headers = request.split('\r\n');

        console.log(`Request: ${request}`);

        function response(contentType, content) {
            console.log(content);
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`)
        }

        function notfound() {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }

        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if (url.includes("/echo/")) {
            const echo = url.split("/echo/")[1];
            response("text/plain", echo);
        } else if (url === "/user-agent") {
            const userAgent = headers[2].split('User-Agent: ')[1];
            response("text/plain", userAgent);
        } else if (url.includes("/files/")) {
            const directory = process.argv[3];
            const filename = url.split("/files/")[1];

            if (fs.existsSync(`${directory}/${filename}`)) {
                const file = fs.readFileSync(`${directory}/${filename}`).toString();
                response("application/octet-stream", file);
            } else {
                notfound();
            }

        } else {
            notfound();
        }
    });

    socket.on("error", (err) => {
        conseole.log("ERROR: " + err);
        socket.end();
    });

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
