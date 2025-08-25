Setup
```
npm init -y
npm install express @modelcontextprotocol/sdk 
npm install --save-dev typescript ts-node @types/node @types/express
npx tsc --init

npm install dotenv
npm install openai
npm install @azure/identity

npx tsc
node dist/client.js
```

Base Proj structure
```
mcp-demo/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── server.ts             # MCP Server (tool + resource provider)
│   ├── client.ts             # MCP Client + Express API
│   ├── tools/                # MCP tools
│   │   ├── echoTool.ts
│   │   └── qaTool.ts
│   ├── resources/            # MCP resources
│   │   └── conversationHistory.ts
│   └── types/                # (optional) custom TS types
├── dist/                     # compiled JS output from tsc
│   ├── server.js
│   └── client.js
└── public/                   # frontend static files
    └── index.html            # calls /query via fetch()
```

Debug
When starting a second process (like server + client), give each its own port:

# Client
node --inspect dist/client.js

# Server
node --inspect=9230 dist/server.js (automatically spawn with client)
```
chorme://inspect/#devices, add port 9230 for server

const transport = new StdioClientTransport({
  command: "node",
  args: ["--inspect=9230", "./dist/server.js"],
});
await client.connect(transport);
The client is spawning the server as a child process.

--inspect=9230 tells Node to open the debugger port, which lets you attach Chrome DevTools to the child server.
```
