import * as janusMessage from '../modules/janus/janusMessages';
import { SocketManager, WEB_SOCKET_EVENTS } from '../modules/socket/SocketManager';
import { RTCManager, SESSION_TYPE } from '../modules/webrtc/RTCManager';

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
	private sessionId: string | null;
	private handleId: string | null;
	private roomId: number;
	private isRoomCreator = false;
	private rtcManager: RTCManager;
	private transactionState: JanusTransactionState;
	private janusSocketManager: SocketManager;

	constructor() {
		this.sessionId = null;
		this.handleId = null;
		this.roomId = 1234;
		this.rtcManager = RTCManager.getInstance();
	}

	private async createOfferSDP() {
		if (!this.sessionId) throw new Error('');
		const peerId = this.rtcManager.createPeerId(this.sessionId, SESSION_TYPE.VIDEO);
		this.rtcManager.getPeer(peerId) || this.rtcManager.createPeer(peerId);
		const offer = await this.rtcManager.createOfferSDP(peerId);
		return offer.sdp;
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
					this.createOfferSDP().then(sdp => sdp && this.sendConfigureMessage(sdp));
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

	public connectJanus() {
		console.log('JanusService::connectJanus');
		const url = `wss://janus.conf.meetecho.com/ws`;
		this.janusSocketManager = new SocketManager(url, 'janus-protocol');
		this.initWebSocketEvents();
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
}
