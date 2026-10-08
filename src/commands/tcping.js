import net from "node:net";
import { performance } from "node:perf_hooks";

function tcpingOnce(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const started = performance.now();
    let done = false;

    function finish(result) {
      if (done) return;
      done = true;
      socket.destroy();
      resolve({
        ...result,
        timeMs: Math.round(performance.now() - started),
      });
    }

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish({ success: true }));
    socket.once("timeout", () => finish({ success: false, error: "timeout" }));
    socket.once("error", (err) =>
      finish({ success: false, error: err.code ?? err.message }),
    );
  });
}

export default {
  name: "tcping",
  summary: "Measure TCP connect latency to a host:port",
  usage: "netlab tcping <host> <port> [--count n] [--timeout ms]",
  options: {
    count: { type: "string", short: "c", default: "4" },
    timeout: { type: "string", short: "t", default: "3000" },
  },
  async run({ values, positionals }) {
    const host = positionals[0];
    const port = positionals[1];
    const count = 4;
    const timeoutMs = 1000;

    for (let i = 1; i <= count; i++) {
      const result = await tcpingOnce(host, port, timeoutMs);
      console.log(
        result.success
          ? `Connected to ${host}:${port} in ${result.timeMs} ms`
          : `Failed to connect to ${host}:${port}: ${result.error}`,
      );
    }
  },
};
