const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const url = data.toString();
        if (url.startsWith("GET / ")) {
            if (url.includes("/echo/")) {
                const content = url.split("/echo/")[1];
                const httpResponse = `Content-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n`;
                socket.write(`HTTP/1.1 200 OK\r\n${httpResponse}\r\n${content}`);
            }
            else {
                socket.write("HTTP/1.1 200 OK\r\n\r\n");
            }
        }
        else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    });

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
