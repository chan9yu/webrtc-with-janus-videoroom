import default_avatar_img from '../assets/images/avatar.jpg';
import { PUBLISHERS } from '../modules/janus/constants';
import * as janusMessage from '../modules/janus/janusMessages';
import { SocketManager } from '../modules/socket/SocketManager';
import { WEB_SOCKET_EVENTS } from '../modules/socket/constants';
import { RTCManager } from '../modules/webrtc/RTCManager';
import { PEER_EVENTS } from '../modules/webrtc/constants';
import { getUserStream } from '../modules/webrtc/utils';

enum JanusTransactionState {
	CREATE_SESSION = 'CREATE_SESSION',
	PLUGIN_ATTACH = 'PLUGIN_ATTACH',
	CREATE_ROOM = 'CREATE_ROOM',
	PUBLISHER_JOIN_ROOM = 'PUBLISHER_JOIN_ROOM',
	SUBSCRIBER_JOIN_ROOM = 'SUBSCRIBER_JOIN_ROOM',

	TERMINATE_ROOM = 'TERMINATE_ROOM',
	SEND_OFFER_SDP = 'SEND_OFFER_SDP',
	SEND_ANSWER_SDP = 'SEND_ANSWER_SDP',
	SEND_CANDIDATE = 'SEND_CANDIDATE',
	KEEP_ALIVE = 'KEEP_ALIVE',
	TERMINATE_SESSION = 'TERMINATE_SESSION'
}

export class AppService {
	private static instance: AppService;

	private sessionId: string | null = null;
	private handleId: string | null = null;
	private roomId: number = 1234;
	private isRoomCreator = false;
	private transactionState: JanusTransactionState | null = null;
	private rtcManager: RTCManager;
	private janusSocketManager: SocketManager;
	private videos = Array.from({ length: PUBLISHERS }, () => document.createElement('video'));

	get videoElements() {
		return this.videos;
	}

	private constructor() {
		this.initVideo();
	}

	private initVideo() {
		this.videos.forEach(video => {
			video.muted = true;
			video.autoplay = true;
			video.playsInline = true;
			video.poster = default_avatar_img;
		});
	}

	public static getInstance() {
		if (!AppService.instance) {
			AppService.instance = new AppService();
		}

		return AppService.instance;
	}

	private onJanusMessage(msg: MessageEvent) {
		const message = JSON.parse(msg.data);

		switch (this.transactionState) {
			case JanusTransactionState.CREATE_SESSION:
				if (message.janus === 'success') {
					this.sessionId = message.data.id;
					this.attachPlugin();
				}
				break;
			case JanusTransactionState.PLUGIN_ATTACH:
				if (message.janus === 'success') {
					this.handleId = message.data.id;
				}
				break;
			case JanusTransactionState.CREATE_ROOM:
				if (message.janus === 'success') {
					console.log('### CREATE_ROOM: ', message);
				}
				break;
			case JanusTransactionState.PUBLISHER_JOIN_ROOM:
				if (message.janus === 'event') {
					console.log('### PUBLISHER_JOIN_ROOM: ', message);
				}
				break;
			case JanusTransactionState.SUBSCRIBER_JOIN_ROOM:
				if (message.janus === 'event') {
					console.log('### SUBSCRIBER_JOIN_ROOM: ', message);
					this.rtcManager.createOfferSDP().then(({ sdp }) => sdp && this.sendConfigureMessage(sdp));
				}
				break;
			case JanusTransactionState.SEND_OFFER_SDP:
				if (message.janus === 'event') {
					this.rtcManager.setRemoteSDP(message.jsep);
				}
				break;
		}
	}

	private initWebSocketEvents() {
		this.janusSocketManager.addListener(WEB_SOCKET_EVENTS.ON_OPEN, () => {
			console.log('JanusService::socket event on open');
			this.transactionState = JanusTransactionState.CREATE_SESSION;
			const message = janusMessage.makeCreateSessionMessage();
			this.janusSocketManager.send(message);
		});

		this.janusSocketManager.addListener(WEB_SOCKET_EVENTS.ON_MESSAGE, (msg: MessageEvent) => {
			console.log('JanusService::socket event on message');
			this.onJanusMessage(msg);
		});

		this.janusSocketManager.addListener(WEB_SOCKET_EVENTS.ON_ERROR, (error: Event) => {
			console.log('JanusService::socket event on error', error);
		});

		this.janusSocketManager.addListener(WEB_SOCKET_EVENTS.ON_CLOSE, () => {
			console.log('JanusService::socket event on close');
		});
	}

	private initPeerEvents() {
		this.rtcManager.addListener(PEER_EVENTS.ON_ICE_CANDIDATE, (candidate: RTCIceCandidate | null) => {
			candidate && this.sendCandidateMessage(candidate);
		});

		this.rtcManager.addListener(PEER_EVENTS.ON_ICE_GATHERING_STATE_CHANGE, (iceState: RTCIceGatheringState) => {
			iceState === 'complete' && this.sendCandidateCompletedMessage();
		});

		this.rtcManager.addListener(PEER_EVENTS.ON_TRACK, () => {
			console.log('### TEST');
		});
	}

	private async startLocalStream() {
		const constraints: MediaStreamConstraints = {
			video: {
				width: { ideal: 640 },
				height: { ideal: 360 }
			},
			audio: false
		};

		const stream = await getUserStream(constraints);
		this.rtcManager.addTrack(stream);
		const localVideo = this.videos[0];
		localVideo.srcObject = stream;
		localVideo.id = 'local-video';
	}

	private createPeer() {
		this.rtcManager = new RTCManager();
		this.initPeerEvents();
		this.startLocalStream();
	}

	public connectJanus() {
		console.log('JanusService::connectJanus');
		const url = `wss://janus.conf.meetecho.com/ws`;
		this.janusSocketManager = new SocketManager(url, 'janus-protocol');
		this.initWebSocketEvents();
		this.createPeer();
	}

	public attachPlugin() {
		if (!this.sessionId) throw new Error('');
		this.transactionState = JanusTransactionState.PLUGIN_ATTACH;
		const message = janusMessage.makeAttachPluginMessage(this.sessionId);
		this.janusSocketManager.send(message);
	}

	public createRoom() {
		if (!this.sessionId || !this.handleId) throw new Error('');
		this.isRoomCreator = true;
		this.transactionState = JanusTransactionState.CREATE_ROOM;
		const message = janusMessage.makeCreateRoomMessage(this.sessionId, this.handleId, { room: this.roomId });
		this.janusSocketManager.send(message);
	}

	public joinRoom(userId: string) {
		if (!this.sessionId || !this.handleId) throw new Error('');
		this.transactionState = this.isRoomCreator
			? JanusTransactionState.PUBLISHER_JOIN_ROOM
			: JanusTransactionState.SUBSCRIBER_JOIN_ROOM;
		const message = janusMessage.makeJoinRoomMessage(this.sessionId, this.handleId, {
			room: this.roomId,
			displayName: userId
		});
		this.janusSocketManager.send(message);
	}

	public sendConfigureMessage(sdp: string) {
		if (!this.sessionId || !this.handleId) throw new Error('');
		this.transactionState = JanusTransactionState.SEND_OFFER_SDP;
		const message = janusMessage.makeConfigureMessage(
			this.sessionId,
			this.handleId,
			{ audio: true, video: true },
			{ sdp }
		);
		this.janusSocketManager.send(message);
	}

	public sendCandidateMessage(candidate: RTCIceCandidate) {
		if (!this.sessionId || !this.handleId) throw new Error('');
		this.transactionState = JanusTransactionState.SEND_CANDIDATE;
		const message = janusMessage.makeCandidateMessage(this.sessionId, this.handleId, candidate);
		this.janusSocketManager.send(message);
	}

	public sendCandidateCompletedMessage() {
		if (!this.sessionId || !this.handleId) throw new Error('');
		this.transactionState = null;
		const message = janusMessage.makeCandidateCompletedMessage(this.sessionId, this.handleId);
		this.janusSocketManager.send(message);
	}
}
