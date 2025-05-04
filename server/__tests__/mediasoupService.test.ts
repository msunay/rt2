import { describe, it, expect, beforeAll, beforeEach, mock } from "bun:test";
import type {
  Consumer,
  MediaKind,
  Producer,
  Router,
  WebRtcServer,
  WebRtcServerOptions,
  WebRtcTransport,
  Worker,
} from "mediasoup/types";

// --- Mocks for the entire 'mediasoup' native API ---
let fakeWorkerEventHandlers: Record<string, Function>;
let fakeTransportEventHandlers: Record<string, Function>;
let fakeProducerEventHandlers: Record<string, Function>;
let fakeConsumerEventHandlers: Record<string, Function>;

const fakeConsumer: Consumer = {
  id: "consumer-id",
  producerId: "producer-id",
  kind: "audio",
  rtpParameters: {},
  on: mock((ev: string, cb: Function) => {
    fakeConsumerEventHandlers[ev] = cb;
  }),
} as any;

const fakeProducer: Producer = {
  id: "producer-id",
  on: mock((ev: string, cb: Function) => {
    fakeProducerEventHandlers[ev] = cb;
  }),
} as any;

const fakeTransport: WebRtcTransport = {
  id: "transport-id",
  iceParameters: { foo: "bar" } as any,
  iceCandidates: [] as any,
  dtlsParameters: {} as any,
  on: mock((ev: string, cb: Function) => {
    fakeTransportEventHandlers[ev] = cb;
  }),
  close: mock(() => {}),
  produce: mock(async (opts) => {
    return Promise.resolve(fakeProducer);
  }),
  consume: mock(async (opts) => {
    return Promise.resolve(fakeConsumer);
  }),
  connect: mock(async (opts) => {
    return Promise.resolve();
  }),
} as any;

const fakeRouter: Router = {
  id: "router-id",
  mediaCodecs: [],
  createWebRtcTransport: mock(async (opts) => {
    return Promise.resolve(fakeTransport);
  }),
  canConsume: mock((args) => args.producerId === "producer-id"),
} as any;

const fakeWebRtcServer: WebRtcServer = {
  close: mock(() => {}),
} as any;

const fakeWorker: Worker = {
  pid: 1234,
  on: mock((ev: string, cb: Function) => {
    fakeWorkerEventHandlers[ev] = cb;
  }),
  createWebRtcServer: mock(async (opts) => {
    return Promise.resolve(fakeWebRtcServer);
  }),
  createRouter: mock(async (opts) => {
    return Promise.resolve(fakeRouter);
  }),
} as any;

mock.module("mediasoup", () => ({
  createWorker: mock(async (opts) => {
    return Promise.resolve(fakeWorker);
  }),
}));

// Now import the service under test:
import {
  MediaSoupService,
  type MediaSoupServiceConfig,
} from "../src/services/mediasoupService";

describe("MediaSoupService", () => {
  let mediasoupService: MediaSoupService;
  const cfg: MediaSoupServiceConfig = {
    worker: { logLevel: "error", logTags: ["info"] },
    webRtcServerOptions: {} as WebRtcServerOptions,
    router: { mediaCodecs: [] },
    iceServers: [],
  };

  beforeAll(() => {
    mediasoupService = new MediaSoupService(cfg);
  });

  beforeEach(() => {
    // reset all mocks and handler maps
    fakeWorkerEventHandlers = {};
    fakeTransportEventHandlers = {};
    fakeProducerEventHandlers = {};
    fakeConsumerEventHandlers = {};

    (fakeWorker.on as any).mockClear();
    (fakeWorker.createWebRtcServer as any).mockClear();
    (fakeWorker.createRouter as any).mockClear();
    (fakeRouter.createWebRtcTransport as any).mockClear();
    (fakeRouter.canConsume as any).mockClear();
    (fakeTransport.on as any).mockClear();
    (fakeTransport.close as any).mockClear();
    (fakeTransport.produce as any).mockClear();
    (fakeTransport.consume as any).mockClear();
    (fakeTransport.connect as any).mockClear();
    (fakeProducer.on as any).mockClear();
    (fakeConsumer.on as any).mockClear();
  });

  it("initialize() should create worker and WebRtcServer", async () => {
    await mediasoupService.initialize();
    expect((fakeWorker.on as any).mock.calls.length).toBeGreaterThan(0);
    expect((fakeWorker.createWebRtcServer as any).mock.calls[0][0]).toEqual(
      cfg.webRtcServerOptions
    );
  });

  it("getOrCreateRouter() should only create one router", async () => {
    // first call
    const r1 = await mediasoupService.getOrCreateRouter();
    expect(r1).toBe(fakeRouter);
    expect((fakeWorker.createRouter as any).mock.calls.length).toBe(1);

    // second call returns same instance
    const r2 = await mediasoupService.getOrCreateRouter();
    expect(r2).toBe(fakeRouter);
    expect((fakeWorker.createRouter as any).mock.calls.length).toBe(1);
  });

  it("createTransport() registers and returns correct transport and options", async () => {
    // mediasoupService.router must be set first
    await mediasoupService.getOrCreateRouter();

    const { transport, transportOptions } =
      await mediasoupService.createTransport("peer1", true);

    expect(transport).toBe(fakeTransport);
    expect(transportOptions).toEqual({
      id: "transport-id",
      iceParameters: fakeTransport.iceParameters,
      iceCandidates: fakeTransport.iceCandidates,
      dtlsParameters: fakeTransport.dtlsParameters,
    });

    // transport is in the map
    expect((mediasoupService as any).transports.has("transport-id")).toBe(true);
    // handlers attached
    expect(typeof fakeTransportEventHandlers.dtlsstatechange).toBe("function");
    expect(typeof fakeTransportEventHandlers["@close"]).toBe("function");
  });

  it("transport dtlsstatechange='closed' and @close remove from map", async () => {
    await mediasoupService.getOrCreateRouter();
    await mediasoupService.createTransport("peer2", false);
    // fire dtlsstatechange
    fakeTransportEventHandlers.dtlsstatechange?.("closed");
    expect((fakeTransport.close as any).mock.calls.length).toBe(1);
    expect((mediasoupService as any).transports.has("transport-id")).toBe(
      false
    );

    // re-add
    await mediasoupService.getOrCreateRouter();
    await mediasoupService.createTransport("peer3", false);
    fakeTransportEventHandlers["@close"]?.();
    expect((mediasoupService as any).transports.has("transport-id")).toBe(
      false
    );
  });

  it("connectTransport() works or throws when missing", async () => {
    // success path
    (mediasoupService as any).transports.set("t1", fakeTransport);
    await mediasoupService.connectTransport("t1", { foo: 1 });
    expect((fakeTransport.connect as any).mock.calls[0][0]).toEqual({
      dtlsParameters: { foo: 1 },
    });

    // missing transport
    await expect(mediasoupService.connectTransport("nope", {})).rejects.toThrow(
      "Transport with id nope not found"
    );
  });

  it("createProducer() works or throws when missing", async () => {
    // missing transport
    await expect(
      mediasoupService.createProducer("nope", "audio" as MediaKind, {}, {})
    ).rejects.toThrow("Transport with id nope not found");

    // success path
    (mediasoupService as any).transports.set("tid", fakeTransport);
    const prod = await mediasoupService.createProducer(
      "tid",
      "audio" as MediaKind,
      { x: 1 },
      { foo: "bar" }
    );
    expect(prod).toBe(fakeProducer);
    expect((fakeTransport.produce as any).mock.calls[0][0]).toEqual({
      kind: "audio",
      rtpParameters: { x: 1 },
      appData: { foo: "bar" },
    });
    // event handler bound
    expect(typeof fakeProducerEventHandlers.transportclose).toBe("function");
  });

  it("createConsumer() handles canConsume=false, missing transport, errors, and success", async () => {
    // must have router
    await mediasoupService.getOrCreateRouter();

    // 1) canConsume = false
    (fakeRouter.canConsume as any).mockReturnValueOnce(false);
    const c1 = await mediasoupService.createConsumer("tid", "producer-id", {});
    expect(c1).toBeNull();

    // 2) missing transport
    (fakeRouter.canConsume as any).mockReturnValueOnce(true);
    await expect(
      mediasoupService.createConsumer("nope", "producer-id", {})
    ).rejects.toThrow("Transport with id nope not found");

    // 3) transport.consume rejects
    (fakeRouter.canConsume as any).mockReturnValueOnce(true);
    const badTransport = { ...fakeTransport };
    (badTransport.consume as any) = mock(() =>
      Promise.reject(new Error("boom"))
    );
    (mediasoupService as any).transports.set("tid2", badTransport as any);
    const c3 = await mediasoupService.createConsumer("tid2", "producer-id", {});
    expect(c3).toBeNull();

    // 4) success path
    (fakeRouter.canConsume as any).mockReturnValue(true);
    (mediasoupService as any).transports.set("tid3", fakeTransport);
    const c4 = await mediasoupService.createConsumer("tid3", "producer-id", {});
    expect(c4).toBe(fakeConsumer);
    // events bound
    expect(typeof fakeConsumerEventHandlers.transportclose).toBe("function");
    expect(typeof fakeConsumerEventHandlers.producerclose).toBe("function");
  });
});
