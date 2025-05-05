import { MediaStreamBroadcaster } from "@/src/services/mediaStreamBroadcaster";
import type { Transport, Consumer } from "mediasoup-client/lib/types";
import type { DtlsParameters } from "mediasoup-client/lib/types";

describe("MediaStreamBroadcaster", () => {
  let broadcaster: MediaStreamBroadcaster;
  let fakeSocket: { emit: jest.Mock };
  let logs: Array<[string, string?]>;

  beforeEach(() => {
    broadcaster = new MediaStreamBroadcaster();

    // Spy on addListener, removeListener, getSocket, and log
    logs = [];
    (broadcaster as any).addListener = jest.fn();
    (broadcaster as any).removeListener = jest.fn();
    (broadcaster as any).getSocket = jest.fn();
    (broadcaster as any).log = (msg: string, level: string = "info") => {
      logs.push([msg, level]);
    };

    fakeSocket = { emit: jest.fn() };
    ((broadcaster as any).getSocket as jest.Mock).mockReturnValue(fakeSocket);
  });

  it("registers and removes the connection_success listener", () => {
    broadcaster.setupConnectionListener();
    expect((broadcaster as any).addListener).toHaveBeenCalledWith(
      "connection_success",
      expect.any(Function),
      "Streaming host connection"
    );

    broadcaster.removeConnectionListener();
    expect((broadcaster as any).removeListener).toHaveBeenCalledWith(
      "connection_success",
      null,
      "Streaming host connection"
    );
  });

  it("setupProducerClosedListener binds consumer.close() and transport.close()", () => {
    const fakeTransport = { close: jest.fn() } as unknown as Transport;
    const fakeConsumer = { close: jest.fn() } as unknown as Consumer;

    broadcaster.setupProducerClosedListener(fakeTransport, fakeConsumer);

    expect((broadcaster as any).addListener).toHaveBeenCalledWith(
      "producer_closed",
      expect.any(Function),
      "Producer closed"
    );

    // extract the callback that was registered
    const handler = ((broadcaster as any).addListener as jest.Mock).mock
      .calls[0][1] as Function;

    // when the server fires 'producer_closed'
    handler();

    expect(fakeConsumer.close).toHaveBeenCalled();
    expect(fakeTransport.close).toHaveBeenCalled();
  });

  it("emits create_room and handles success + logging", async () => {
    const createDevice = jest.fn().mockResolvedValue(undefined);
    const caps = { codecs: [] };
    broadcaster.createRoom(createDevice);

    // Did we emit with the right event name?
    expect(fakeSocket.emit).toHaveBeenCalledWith(
      "create_room",
      expect.any(Function)
    );

    // grab the callback the broadcaster passed to emit()
    const cb = (fakeSocket.emit as jest.Mock).mock.calls[0][1] as Function;

    // simulate the server callback
    await cb({ rtpCapabilities: caps });

    expect(logs).toEqual([
      ["Router RTP Capabilities received", "info"],
      ["Device created with RTP capabilities", "info"],
    ]);

    expect(createDevice).toHaveBeenCalledWith(caps);
  });

  it("emit create_room and logs error when createDevice rejects", async () => {
    const createDevice = jest.fn().mockRejectedValue(new Error("nope"));
    broadcaster.createRoom(createDevice);

    const cb = (fakeSocket.emit as jest.Mock).mock.calls[0][1] as Function;
    await cb({ rtpCapabilities: { codecs: [] } });

    // first log is always the RTP caps message
    expect(logs[0]).toEqual(["Router RTP Capabilities received", "info"]);
    // second log indicates error
    expect(logs[1][0]).toMatch(/^Error creating device:/);
    expect(logs[1][1]).toBe("error");
  });

  describe("createProducerTransport", () => {
    let fakeDevice: any;
    let fakeProducerTransport: any;
    let setProducerTransport: jest.Mock;
    let connectSendTransport: jest.Mock;

    beforeEach(() => {
      fakeProducerTransport = {
        id: "ptrans-id",
        on: jest.fn(),
      };
      fakeDevice = {
        createSendTransport: jest.fn(() => fakeProducerTransport),
      };
      setProducerTransport = jest.fn();
      connectSendTransport = jest.fn().mockResolvedValue(undefined);
    });

    it("emits createWebRtcTransport and wires up send‐transport", async () => {
      broadcaster.createProducerTransport(
        setProducerTransport,
        fakeDevice,
        connectSendTransport
      );

      // must emit
      expect(fakeSocket.emit).toHaveBeenCalledWith(
        "createWebRtcTransport",
        { producer: true },
        expect.any(Function)
      );

      // grab the callback handler
      const handler = (fakeSocket.emit as jest.Mock).mock
        .calls[0][2] as Function;
      const transportOptions = { id: "topt" };
      // simulate server reply
      handler({ transportOptions });

      // 1) device.createSendTransport
      expect(fakeDevice.createSendTransport).toHaveBeenCalledWith(
        transportOptions
      );
      // 2) setProducerTransport
      expect(setProducerTransport).toHaveBeenCalledWith(fakeProducerTransport);
      // 3) log creation
      expect(
        logs.find(([m]) =>
          m.includes(`Created send transport: ${fakeProducerTransport.id}`)
        )
      ).toBeTruthy();

      // 4) transport.on("connect", …)
      expect(fakeProducerTransport.on).toHaveBeenCalledWith(
        "connect",
        expect.any(Function)
      );
      // 5) transport.on("produce", …)
      expect(fakeProducerTransport.on).toHaveBeenCalledWith(
        "produce",
        expect.any(Function)
      );

      // 6) connectSendTransport invoked
      expect(connectSendTransport).toHaveBeenCalledWith(fakeProducerTransport);
    });

    it("invokes onSuccess when transport.connect event fires", () => {
      broadcaster.createProducerTransport(
        setProducerTransport,
        fakeDevice,
        connectSendTransport
      );
      const cb = (fakeSocket.emit as jest.Mock).mock.calls[0][2] as Function;
      cb({ transportOptions: {} });

      // pull out the connect listener
      const connectListener = fakeProducerTransport.on.mock.calls.find(
        ([evt]: any[]) => evt === "connect"
      )![1] as Function;

      const dtlsParams: DtlsParameters = { role: "auto", fingerprints: [] };
      const onSuccess = jest.fn();
      const onError = jest.fn();

      connectListener({ dtlsParameters: dtlsParams }, onSuccess, onError);

      // should emit the socket event
      expect(fakeSocket.emit).toHaveBeenCalledWith("transport_connect", {
        dtlsParameters: dtlsParams,
      });
      // and call onSuccess
      expect(onSuccess).toHaveBeenCalled();
    });

    it("invokes onSuccess when transport.produce event fires", () => {
      broadcaster.createProducerTransport(
        setProducerTransport,
        fakeDevice,
        connectSendTransport
      );
      const cb = (fakeSocket.emit as jest.Mock).mock.calls[0][2] as Function;
      cb({ transportOptions: {} });

      const produceListener = fakeProducerTransport.on.mock.calls.find(
        ([evt]: any[]) => evt === "produce"
      )![1] as Function;

      // stub emit to call back immediately
      (fakeSocket.emit as jest.Mock).mockImplementation((_, payload, cb) => {
        cb({ id: "new-prod" });
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();
      const params = {
        kind: "audio",
        rtpParameters: {},
        appData: {},
      };

      produceListener(params, onSuccess, onError);

      // should emit transport_produce
      expect(fakeSocket.emit).toHaveBeenCalledWith(
        "transport_produce",
        params,
        expect.any(Function)
      );
      // and call onSuccess
      expect(onSuccess).toHaveBeenCalledWith({ id: "new-prod" });
    });
  });
});
