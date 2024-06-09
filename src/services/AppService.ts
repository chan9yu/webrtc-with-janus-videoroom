/* eslint-disable @typescript-eslint/no-explicit-any */

import { RTCManager } from '../modules/webrtc/RTCManager';
import { SocketManager, WEB_SOCKET_EVENTS } from '../modules/socket/SocketManager';

export class AppService {
	private server: string;
	private socketManager: SocketManager;
	private rtcManager: RTCManager;
	private sessionId: number | null;
	private handleId: number | null;
	private roomId: number;

	constructor() {
		this.server = 'wss://janus.conf.meetecho.com/ws';
		this.sessionId = null;
		this.handleId = null;
		this.roomId = 1234; // 원하는 방 ID 설정
		this.rtcManager = new RTCManager();
		this.socketManager = new SocketManager(this.server, 'janus-protocol');
		this.initWebSocketEvents();
	}

	private initWebSocketEvents() {
		this.socketManager.addListener(WEB_SOCKET_EVENTS.ON_OPEN, () => {
			console.log('JanusClient::socket event on open');
			this.createSession();
		});

		this.socketManager.addListener(WEB_SOCKET_EVENTS.ON_MESSAGE, (msg: MessageEvent<any>) => {
			const data = JSON.parse(msg.data);
			console.log('JanusClient::socket event on message', data);
			this.handleMessage(data);
		});

		this.socketManager.addListener(WEB_SOCKET_EVENTS.ON_ERROR, (error: Event) => {
			console.log('JanusClient::socket event on error', error);
		});

		this.socketManager.addListener(WEB_SOCKET_EVENTS.ON_CLOSE, () => {
			console.log('JanusClient::socket event on close');
		});
	}

	private createSession() {
		const message = {
			janus: 'create',
			transaction: this.randomString(12)
		};
		this.socketManager.send(message);
	}

	private attachPlugin() {
		const message = {
			janus: 'attach',
			plugin: 'janus.plugin.videoroom',
			transaction: this.randomString(12),
			session_id: this.sessionId
		};
		this.socketManager.send(message);
	}

	private joinRoom() {
		const message = {
			janus: 'message',
			body: {
				request: 'join',
				room: this.roomId,
				ptype: 'publisher',
				display: 'user' + Math.floor(Math.random() * 1000)
			},
			transaction: this.randomString(12),
			session_id: this.sessionId,
			handle_id: this.handleId
		};
		this.socketManager.send(message);
	}

	private createOffer(stream: MediaStream) {
		const pc = this.rtcManager.createPeerConnection(
			'local',
			stream,
			event => {
				console.log('Remote track received:', event);
				this.handleRemoteStream(event.streams[0], 'remote');
			},
			candidate => {
				const message = {
					janus: 'trickle',
					candidate: candidate,
					transaction: this.randomString(12),
					session_id: this.sessionId,
					handle_id: this.handleId
				};
				this.socketManager.send(message);
			}
		);

		pc.createOffer().then(offer => {
			pc.setLocalDescription(offer);
			const message = {
				janus: 'message',
				body: { request: 'publish', audio: true, video: true },
				jsep: offer,
				transaction: this.randomString(12),
				session_id: this.sessionId,
				handle_id: this.handleId
			};
			this.socketManager.send(message);
		});

		return pc;
	}

	private handleRemoteStream(stream: MediaStream, id: string) {
		const videoElement = document.createElement('video');
		videoElement.id = `remoteVideo-${id}`;
		videoElement.srcObject = stream;
		videoElement.autoplay = true;
		videoElement.playsInline = true;
		document.getElementById('remoteVideos')?.appendChild(videoElement);
	}

	private handleMessage(data: any) {
		console.log('Received message:', data);

		if (data.janus === 'success') {
			if (data.transaction) {
				if (!this.sessionId) {
					this.sessionId = data.data.id;
					this.attachPlugin();
				} else if (!this.handleId) {
					this.handleId = data.data.id;
					this.joinRoom();
				}
			}
		} else if (data.janus === 'event' && data.plugindata) {
			const event = data.plugindata.data.videoroom;

			if (event === 'joined') {
				navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
					this.createOffer(stream);
					const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
					localVideo.srcObject = stream;
				});
			} else if (event === 'event' && data.plugindata.data.publishers) {
				data.plugindata.data.publishers.forEach((publisher: any) => {
					this.subscribeToPublisher(publisher.id);
				});
			}
		} else if (data.janus === 'event' && data.jsep) {
			if (data.jsep.type === 'offer') {
				const pc = this.rtcManager.createPeerConnection(
					data.sender,
					new MediaStream(),
					event => {
						console.log('Remote track received:', event);
						this.handleRemoteStream(event.streams[0], data.sender);
					},
					candidate => {
						const message = {
							janus: 'trickle',
							candidate: candidate,
							transaction: this.randomString(12),
							session_id: this.sessionId,
							handle_id: this.handleId
						};
						this.socketManager.send(message);
					}
				);

				pc.setRemoteDescription(new RTCSessionDescription(data.jsep))
					.then(() => pc.createAnswer())
					.then(answer => pc.setLocalDescription(answer))
					.then(() => {
						const message = {
							janus: 'message',
							body: { request: 'start', room: this.roomId },
							jsep: pc.localDescription,
							transaction: this.randomString(12),
							session_id: this.sessionId,
							handle_id: this.handleId
						};
						this.socketManager.send(message);
					});
			}
		}
	}

	private subscribeToPublisher(publisherId: string) {
		const message = {
			janus: 'message',
			body: {
				request: 'join',
				room: this.roomId,
				ptype: 'subscriber',
				feed: publisherId
			},
			transaction: this.randomString(12),
			session_id: this.sessionId,
			handle_id: this.handleId
		};
		this.socketManager.send(message);
	}

	private randomString(len: number) {
		const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let randomString = '';
		for (let i = 0; i < len; i++) {
			const randomPoz = Math.floor(Math.random() * charSet.length);
			randomString += charSet.substring(randomPoz, randomPoz + 1);
		}
		return randomString;
	}
}
