"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamClient = void 0;
const stream_chat_1 = require("stream-chat");
exports.streamClient = stream_chat_1.StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
//# sourceMappingURL=stream.js.map