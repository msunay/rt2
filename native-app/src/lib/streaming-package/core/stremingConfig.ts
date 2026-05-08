import { AppData } from 'mediasoup-client/types';
import { Constraints } from 'react-native-webrtc/lib/typescript/getUserMedia';
import { TurnCredentials } from './types';

export class StreamingConfiguration {
    private static readonly DEFAULT_STUN_SERVER = 'stun:turn.alexeze.co.uk:3478';
    private static readonly TURN_SERVER_BASE = 'turn.alexeze.co.uk';

    /**
     * Get ICE servers configuration
     */
    static getIceServers(credentials: TurnCredentials): RTCIceServer[] {
        return [
            {
                urls: this.DEFAULT_STUN_SERVER,
            },
            {
                urls: `turn:${this.TURN_SERVER_BASE}:3478?transport=udp`,
                username: credentials.username,
                credential: credentials.credential,
            },
            {
                urls: `turn:${this.TURN_SERVER_BASE}:3478?transport=tcp`,
                username: credentials.username,
                credential: credentials.credential,
            },
            {
                urls: `turn:${this.TURN_SERVER_BASE}:5349?transport=udp`,
                username: credentials.username,
                credential: credentials.credential,
            },
            {
                urls: `turns:${this.TURN_SERVER_BASE}:5349?transport=tcp`,
                username: credentials.username,
                credential: credentials.credential,
            },
        ];
    }

    /**
     * Get default media constraints
     */
    static getMediaConstraints(): Constraints {
        return {
            audio: true,
            video: {
                facingMode: 'user',
                width: {
                    min: 640,
                    ideal: 1280,
                    max: 1920,
                },
                height: {
                    min: 400,
                    ideal: 720,
                    max: 1080,
                },
                frameRate: {
                    ideal: 30,
                },
            },
        };
    }

    /**
     * Get default encoding parameters for producers
     */
    static getEncodingParams(): AppData {
        return {
            encodings: [
                {
                    rid: 'r0',
                    maxBitrate: 200 * 1000,
                    scalabilityMode: 'S1T3',
                },
                {
                    rid: 'r1',
                    maxBitrate: 800 * 1000,
                    scalabilityMode: 'S1T3',
                },
                {
                    rid: 'r2',
                    maxBitrate: 2000 * 1000,
                    scalabilityMode: 'S1T3',
                },
            ],
            codecOptions: {
                videoGoogleStartBitrate: 1500,
            },
        };
    }

    /**
     * Validate configuration
     */
    static validateConfig(config: any): void {
        if (!config.turnCredentials) {
            throw new Error('TURN credentials are required');
        }

        if (!config.turnCredentials.username || !config.turnCredentials.credential) {
            throw new Error('Invalid TURN credentials: username and credential are required');
        }

        if (config.role && !['PRODUCER', 'CONSUMER'].includes(config.role)) {
            throw new Error('Invalid role: must be PRODUCER or CONSUMER');
        }
    }
}
