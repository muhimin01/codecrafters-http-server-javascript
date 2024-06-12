const net = require("net");
const fs = require("fs");
const zlib = require("zlib");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const parseRequest = (requestData) => {
    const request = requestData.toString().split("\r\n");
    const [method, url, protocol] = request[0].split(" ");
    const headers = {};

    request.slice(1).forEach((header) => {
        const [key, ...values] = header.split(" ");

        if (key && values.length > 0) {
            const trimmedKey = key.trim();
            const trimmedValues = values.map(value => value.trim().replace(/,$/, "")); // Trim values and remove trailing commas

            if (!headers[trimmedKey]) {
                headers[trimmedKey] = [];
            }
            headers[trimmedKey].push(...trimmedValues);
        }
    });

    return { method, url, protocol, headers };
};

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);
        const { method, url, protocol, headers } = request;

        console.log(`Request: ${method} ${url} ${protocol}`);
        console.log(headers);

        function response(contentType, content, encoding) {
            let rsp = "HTTP/1.1 200 OK\r\n";
            rsp += `Content-Type: ${contentType}\r\n`;
            if (encoding != null) {
                const body = zlib.gzipSync(content.toString());
                console.log(`Content: ${content}`);
                console.log(`Body: ${body}`);
                rsp += `Content-Encoding: ${encoding}\r\n`;
                rsp += `Content-Length: ${Buffer.byteLength(body)}\r\n`;
                rsp += `\r\n${body}\r\n`;
            }
            else {
                rsp += `Content-Length: ${content.length}\r\n`;
                rsp += `\r\n${content}\r\n`;
            }
            console.log(rsp);
            socket.write(rsp);
        }

        function notfound() {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }

        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");

        } else if (url.startsWith("/echo/")) {
            const echo = url.split("/echo/")[1];
            if (headers.hasOwnProperty("Accept-Encoding:") && headers["Accept-Encoding:"].includes("gzip")) {
                const encoding = "gzip";
                response("text/plain", echo, encoding);
            }
            else {
                response("text/plain", echo);
            }

        } else if (url.startsWith("/user-agent")) {
            const userAgent = headers["User-Agent:"].toString();
            response("text/plain", userAgent);

        } else if (url.startsWith("/files/") && method === "GET") {
            const filePath = process.argv[3];
            const fileName = url.split("/files/")[1];

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
