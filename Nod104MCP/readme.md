npm init -y
npm install express @modelcontextprotocol/sdk 
npm install --save-dev typescript ts-node @types/node @types/express
npx tsc --init

npx tsc
node dist/client.js

mcp-demo/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts        # MCP Server (tool provider)
│   ├── client.ts        # MCP Client + Express API
│   └── types/           # (optional) custom TS types
├── dist/                # compiled JS output from tsc
│   ├── server.js
│   └── client.js
├── public/              # (optional) static frontend files
│   └── index.html       # can call /query via fetch()
└── README.md