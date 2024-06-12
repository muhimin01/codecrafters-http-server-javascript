const net = require("net");
const fs = require("fs");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const parseRequest = (requestData) => {
    const request = requestData.toString().split("\r\n");
    const [method, url, protocol] = request[0].split(" ");
    const headers = {};

    request.slice(1).forEach((header) => {
        const [key, value] = header.split(" ");

        if (key && value) {
            headers[key] = value;
        }
    });

    return { method, url, protocol, headers };
};

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);
        const { method, url, protocol, headers } = request;

        console.log(`Request: ${method} ${url} ${protocol}`);
        console.log(headers);


        function response(contentType, content, encoding) {
            //socket.write(`HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`)
            let rsp = "HTTP/1.1 200 OK\r\n";
            if (encoding != null) {
                rsp += `Content-Encoding: ${encoding}\r\n`;
            }
            rsp += `Content-Type: ${contentType}\r\n`;
            rsp += `Content-Length: ${content.length}\r\n`;
            rsp += `\r\n${content}\r\n`;
            socket.write(rsp);
        }

        function notfound() {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }

        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");

        } else if (url.startsWith("/echo/")) {
            const echo = url.split("/echo/")[1];
            if (headers.hasOwnProperty("Accept-Encoding:")) {
                //console.log(headers["Accept-Encoding:"]);
                const encoding = headers["Accept-Encoding:"];
                response("text/plain", echo, encoding);
            }
            else {
                response("text/plain", echo);
            }

        } else if (url.startsWith("/user-agent")) {
            const userAgent = headers["User-Agent:"];
            response("text/plain", userAgent);

        } else if (url.startsWith("/files/") && method === "GET") {
            const filePath = process.argv[3];
            const fileName = url.split("/files/")[1];

            console.log(`${filePath}/${fileName}`)

            if (fs.existsSync(`${filePath}/${fileName}`)) {
                const file = fs.readFileSync(`${filePath}/${fileName}`).toString();
                response("application/octet-stream", file);
            } else {
                notfound();
            }

        } else if (url.startsWith("/files/") && method === "POST") {
            const fileName = process.argv[3] + "/" + url.substring(7);
            const req = data.toString().split("\r\n");
            const body = req[req.length - 1];

            fs.writeFileSync(fileName, body);
            socket.write("HTTP/1.1 201 Created\r\n\r\n")
        }

        else {
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
