'use client'

import React, { useRef } from "react";
import styles from "./mediasoup.module.css";
import { io } from "socket.io-client";

function stream() {

  const localVideo = useRef<any>(null)

  const socket = io("http://localhost:3001/mediasoup");

  socket.on('connection_success', ({ socketId }) => {
    console.log(socketId);
  })

  const streamSuccess = async (mediaStream: MediaStream) => {
    localVideo.current.srcObject = mediaStream;
    const track = mediaStream.getVideoTracks()[0]

  }

  const getLocalStream = async () => {
    await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: {
          min: 640,
          max: 1920
        },
        height: {
          min : 400,
          max: 1080
        }
      }
    })
      .then((mediaStream) => {
      streamSuccess(mediaStream);
    })
      .catch(err => console.error(err));
  }

  return (
    <main>
      <div id="video">
        <table>
          <thead>
            <tr>
              <th>Local Video</th>
              <th>Remote Video</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.tr}>
              <td>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <video
                    ref={localVideo}
                    id="localVideo"
                    autoPlay={true}
                    className={styles.video}
                  ></video>
                </div>
              </td>
              <td>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <video
                    id="remoteVideo"
                    autoPlay={true}
                    className={styles.video}
                  ></video>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <button className={styles.button} id="btnLocalVideo" onClick={getLocalStream}>
                    1. Get Local Video
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <button className={styles.button} id="btnRtpCapabilities">
                    2. Get Rtp Capabilities
                  </button>
                  <br />
                  <button className={styles.button} id="btnDevice">
                    3. Create Device
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <button className={styles.button} id="btnCreateSendTransport">
                    4. Create Send Transport
                  </button>
                  <br />
                  <button
                    className={styles.button}
                    id="btnConnectSendTransport"
                  >
                    5. Connect Send Transport & Produce
                  </button>
                </div>
              </td>
              <td>
                <div className={styles.sharedBtns} id="sharedBtns">
                  <button className={styles.button} id="btnRecvSendTransport">
                    6. Create Recv Transport
                  </button>
                  <br />
                  <button
                    className={styles.button}
                    id="btnConnectRecvTransport"
                  >
                    7. Connect Recv Transport & Consume
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default stream;
