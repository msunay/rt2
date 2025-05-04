import {
  describe,
  it,
  expect,
  beforeEach,
  mock,
  beforeAll,
  afterAll,
  afterEach,
} from "bun:test";
import { io } from "socket.io-client";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { MediaSoupService } from "@/services/mediasoupService";
import { peerSocketInit } from "@/controllers/broadcastSocketController";

const getOrCreateRouter = mock(() =>
  Promise.resolve({ id: "router1", rtpCapabilities: { codecs: [] } })
);
const createTransport = mock(() =>
  Promise.resolve({
    transport: { id: "t1" },
    transportOptions: { id: "t1" },
  })
);
const createProducer = mock(() => Promise.resolve({ id: "prod1" }));
const createConsumer = mock(() =>
  Promise.resolve({
    id: "cons1",
    producerId: "prod1",
    kind: "audio",
    rtpParameters: {},
  })
);
const connectTransport = mock(() => Promise.resolve());
const cleanup = mock((socketId) => {
  console.log("CLEANUP CALLED with arg:", socketId);
  return Promise.resolve();
});

mock.module("@/services/mediasoupService", () => {
  console.log("Setting up MediaSoupService mock");

  const MockMediaSoupService = class {
    constructor(config: any) {
      console.log("MediaSoupService constructor called");
      return {
        getOrCreateRouter,
        createTransport,
        createProducer,
        createConsumer,
        connectTransport,
        cleanup,
        initialize: mock(() => {
          console.log("Mock initialize called");
          return Promise.resolve();
        }),
      };
    }
  };

  return {
    MediaSoupService: MockMediaSoupService,
  };
});

describe("peerSocketInit", () => {
  let httpServer: any;
  let ioServer: any;
  let port: number;
  let clientSocket: any;
  let serverSocket: any;
  let mediaSoupService: any;

  beforeAll(async () => {
    console.log("beforeAll: Creating MediaSoupService");
    // Create MediaSoupService instance
    mediaSoupService = new MediaSoupService({} as any);
    console.log("beforeAll: MediaSoupService initialized");

    return new Promise<void>((resolve) => {
      httpServer = createServer();
      ioServer = require("socket.io")(httpServer);

      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    console.log("\n--- Starting new test ---");

    // Clear all mocks before each test
    getOrCreateRouter.mockClear();
    createTransport.mockClear();
    createProducer.mockClear();
    createConsumer.mockClear();
    connectTransport.mockClear();
    cleanup.mockClear();

    // Create a new client for each test
    clientSocket = io(`http://localhost:${port}`);

    // Set up a connection promise to capture server socket
    const connectionPromise = new Promise<void>((resolve) => {
      ioServer.once("connection", (socket: any) => {
        serverSocket = socket;
        console.log(
          "beforeEach: Server socket connected, calling peerSocketInit"
        );
        // Pass the shared MediaSoupService instance
        peerSocketInit(socket, mediaSoupService);
        resolve();
      });
    });

    await connectionPromise;
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  it("should emit connection_success on init", async () => {
    const data = await new Promise((resolve) => {
      clientSocket.on("connection_success", resolve);
    });

    expect(data).toEqual({
      socketId: clientSocket.id,
      producerAlreadyExists: false,
    });
  });

  it("should handle disconnect and call cleanup", async () => {
    const socketId = serverSocket.id;
    console.log("Test: Starting with socket ID:", socketId);

    const disconnectPromise = new Promise<void>((resolve) => {
      serverSocket.once("disconnect", () => {
        console.log("Test: Server disconnect event received");
        resolve();
      });
    });

    console.log("Test: Disconnecting client...");
    clientSocket.disconnect();

    console.log("Test: Waiting for disconnect promise...");
    await disconnectPromise;

    console.log("Test: Waiting for cleanup to process...");
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("Test: Cleanup mock calls:", cleanup.mock.calls);
    console.log("Test: Cleanup mock call count:", cleanup.mock.calls.length);

    expect(cleanup).toHaveBeenCalledWith(socketId);
  });

  it("should handle create_room event", async () => {
    // emit the event with a callback as the first (and only) argument
    const res = await new Promise<any>((resolve) => {
      clientSocket.emit("create_room", resolve);
    });

    // your mock should have been called exactly once
    expect(getOrCreateRouter).toHaveBeenCalledTimes(1);

    // and the response payload should match what you resolved in your mock
    expect(res).toEqual({ rtpCapabilities: { codecs: [] } });
  });

  it("should handle getRtpCapabilities event", async () => {
    const res = await new Promise<any>((resolve) => {
      clientSocket.emit("getRtpCapabilities", resolve);
    });

    expect(getOrCreateRouter).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ rtpCapabilities: { codecs: [] } });
  });

  it("should create a producer WebRTC transport and then connect it", async () => {
    // first step: ask for a producer transport
    const { transportOptions } = await new Promise<any>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: true }, resolve);
    });
    // your mock createTransport should have been called with (socketId, true)
    expect(createTransport).toHaveBeenCalledWith(serverSocket.id, true);
    expect(transportOptions).toEqual({ id: "t1" });

    // now exercise the transport_connect path
    const fakeDtls = { foo: "bar" };
    clientSocket.emit("transport_connect", { dtlsParameters: fakeDtls });
    // wait a tick for the handler to fire
    await new Promise((r) => setTimeout(r, 0));

    expect(connectTransport).toHaveBeenCalledWith("t1", fakeDtls);
  });

  it("should create a consumer WebRTC transport and then connect it", async () => {
    // first step: ask for a consumer transport
    const { transportOptions } = await new Promise<any>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: false }, resolve);
    });
    expect(createTransport).toHaveBeenCalledWith(serverSocket.id, false);
    expect(transportOptions).toEqual({ id: "t1" });

    // now exercise the transport_recv_connect path
    const fakeDtls = { baz: 123 };
    clientSocket.emit("transport_recv_connect", { dtlsParameters: fakeDtls });
    await new Promise((r) => setTimeout(r, 0));

    expect(connectTransport).toHaveBeenCalledWith("t1", fakeDtls);
  });

  it("should produce and then consume media", async () => {
    // 1) create the producer transport
    await new Promise<any>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: true }, resolve);
    });

    // 2) produce
    const producePayload = { kind: "audio", rtpParameters: {}, appData: { x: 1 } };
    const produceRes = await new Promise<any>((resolve) => {
      clientSocket.emit("transport_produce", producePayload, resolve);
    });
    expect(createProducer).toHaveBeenCalledWith(
      "t1",
      "audio",
      {},
      { x: 1 }
    );
    expect(produceRes).toEqual({ id: "prod1" });

    // 3) create the consumer transport
    await new Promise<any>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: false }, resolve);
    });

    // 4) consume
    const consumeRes = await new Promise<any>((resolve) => {
      clientSocket.emit("consume", { rtpCapabilities: {} }, resolve);
    });
    expect(createConsumer).toHaveBeenCalledWith(
      "t1",
      "prod1",
      {}
    );
    expect(consumeRes).toEqual({
      consumerOptions: {
        id: "cons1",
        producerId: "prod1",
        kind: "audio",
        rtpParameters: {},
      },
    });
  });

  it("should stash transport and producer/consumer IDs on socket.data", async () => {
    // Producer transport
    await new Promise<void>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: true }, resolve);
    });
    expect(serverSocket.data.producerTransportId).toBe("t1");
    expect(serverSocket.data.consumerTransportId).toBe("");

    // Produce
    await new Promise<void>((resolve) => {
      clientSocket.emit(
        "transport_produce",
        { kind: "audio", rtpParameters: {}, appData: {} },
        resolve
      );
    });
    expect(serverSocket.data.producerId).toBe("prod1");
    expect(serverSocket.data.consumerId).toBe("");

    // Consumer transport
    await new Promise<void>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: false }, resolve);
    });
    expect(serverSocket.data.consumerTransportId).toBe("t1");

    // Consume
    await new Promise<void>((resolve) => {
      clientSocket.emit("consume", { rtpCapabilities: {} }, resolve);
    });
    expect(serverSocket.data.consumerId).toBe("cons1");
  });

  it("should callback with {error} when createWebRtcTransport fails", async () => {
    createTransport.mockImplementationOnce(() =>
      Promise.reject(new Error("transport‐boom"))
    );

    const res = await new Promise<any>((resolve) => {
      clientSocket.emit("createWebRtcTransport", { producer: true }, resolve);
    });

    expect(res).toEqual({ error: "transport‐boom" });
  });

  it("should callback with {error} when transport_produce fails", async () => {
    createProducer.mockImplementationOnce(() =>
      Promise.reject(new Error("produce‐fail"))
    );

    await new Promise<void>((r) =>
      clientSocket.emit("createWebRtcTransport", { producer: true }, r)
    );

    const res = await new Promise<any>((resolve) => {
      clientSocket.emit(
        "transport_produce",
        { kind: "audio", rtpParameters: {}, appData: {} },
        resolve
      );
    });

    expect(res).toEqual({ error: "produce‐fail" });
  });

  it("should callback with {error} when consume fails", async () => {
    createConsumer.mockImplementationOnce(() =>
      Promise.reject(new Error("consume‐fail"))
    );

    await new Promise<void>((r) =>
      clientSocket.emit("createWebRtcTransport", { producer: true }, r)
    );
    await new Promise<void>((r) =>
      clientSocket.emit(
        "transport_produce",
        { kind: "video", rtpParameters: {}, appData: {} },
        r
      )
    );
    await new Promise<void>((r) =>
      clientSocket.emit("createWebRtcTransport", { producer: false }, r)
    );

    const res = await new Promise<any>((resolve) => {
      clientSocket.emit("consume", { rtpCapabilities: {} }, resolve);
    });

    expect(res).toEqual({ error: "consume‐fail" });
  });

  it("should broadcast new_producer to other peers", async () => {
    // wire up a second client
    const other = io(`http://localhost:${port}`);
    const got = new Promise<{ producerId: string }>((resolve) => {
      other.on("new_producer", resolve);
    });

    ioServer.on("connection", (socket: any) =>
      peerSocketInit(socket, mediaSoupService)
    );

    // wait for the second client to connect & init
    await new Promise((r) => other.once("connection_success", r));

    // 1) have first client produce
    await new Promise<void>((r) =>
      clientSocket.emit("createWebRtcTransport", { producer: true }, r)
    );
    await new Promise<void>((r) =>
      clientSocket.emit(
        "transport_produce",
        { kind: "audio", rtpParameters: {}, appData: {} },
        r
      )
    );

    // 2) assert the other client saw the broadcast
    const payload = await got;
    expect(payload).toEqual({ producerId: "prod1" });

    other.disconnect();
  });


});
