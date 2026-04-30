// MSW v2 requires WHATWG Fetch API globals; jsdom doesn't expose them.
// Use vm.runInThisContext to access Node 25's native WHATWG fetch implementation,
// which has a proper ReadableStream body required by @mswjs/interceptors.
const vm = require("vm");
const {TextDecoder, TextEncoder} = require("util");
const {TransformStream, ReadableStream, WritableStream} = require("stream/web");
const {BroadcastChannel} = require("worker_threads");

if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
if (!global.TransformStream) global.TransformStream = TransformStream;
if (!global.ReadableStream) global.ReadableStream = ReadableStream;
if (!global.WritableStream) global.WritableStream = WritableStream;
if (!global.BroadcastChannel) global.BroadcastChannel = BroadcastChannel;

// Grab native WHATWG fetch from Node's outer context (bypasses jsdom's window)
if (!global.fetch) global.fetch = vm.runInThisContext("typeof fetch !== 'undefined' ? fetch : undefined");
if (!global.Request) global.Request = vm.runInThisContext("typeof Request !== 'undefined' ? Request : undefined");
if (!global.Response) global.Response = vm.runInThisContext("typeof Response !== 'undefined' ? Response : undefined");
if (!global.Headers) global.Headers = vm.runInThisContext("typeof Headers !== 'undefined' ? Headers : undefined");
