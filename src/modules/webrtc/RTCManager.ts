import { EventEmitter } from 'events';

export enum SESSION_TYPE {
	VIDEO = 0,
	AUDIO = 1,
	SCREEN = 2
}

export type ICEServerInfo = {
	urls: string;
	username: string;
	credential: string;
};

export class RTCManager extends EventEmitter {
	private static instance?: RTCManager;

	private peerList: Map<string, RTCPeerConnection> = new Map();
	private iceServers: ICEServerInfo[] = [];

	private constructor() {
		super();
	}

	public static getInstance() {
		if (!RTCManager.instance) {
			RTCManager.instance = new RTCManager();
		}
		return RTCManager.instance;
	}

	private initPeerEvents(id: string, peer: RTCPeerConnection) {
		peer.onconnectionstatechange = event => {
			console.log(event);
		};

		peer.onsignalingstatechange = event => {
			console.log(event);
		};

		peer.onicecandidate = event => {
			console.log(event);
		};

		peer.onnegotiationneeded = event => {
			console.log(event);
		};

		peer.ontrack = event => {
			console.log(event);
		};

		peer.ondatachannel = event => {
			console.log(event);
		};
	}

	public createPeerId(id: string, sessionType: SESSION_TYPE) {
		const peerId = `${id}-${sessionType}`;
		return peerId;
	}

	public createPeer(peerId: string, options?: RTCConfiguration) {
		const configuration = { ...options, iceServers: this.iceServers };
		const peer = new RTCPeerConnection(configuration);
		this.initPeerEvents(peerId, peer);
		this.peerList.set(peerId, peer);
	}

	public removePeer(peerId: string) {
		this.peerList.get(peerId)?.close();
		this.peerList.delete(peerId);
	}

	public resetPeer(peerId: string, options?: RTCConfiguration) {
		this.removePeer(peerId);
		this.createPeer(peerId, options);
	}

	public getPeer(peerId: string) {
		const peer = this.peerList.get(peerId);
		return peer;
	}

	public addTrack(peerId: string, stream: MediaStream) {
		const peer = this.getPeer(peerId);
		if (!peer) throw new Error('peer not found');
		stream.getTracks().forEach(track => {
			peer.addTrack(track, stream);
		});
	}

	public async createOfferSDP(peerId: string, options?: RTCOfferOptions) {
		const peer = this.getPeer(peerId);
		if (!peer) throw new Error('peer not found');
		const offer = await peer.createOffer(options);
		peer.setLocalDescription(offer);
		return offer;
	}

	public async setRemoteSDP(peerId: string, sdp: RTCSessionDescriptionInit) {
		const peer = this.getPeer(peerId);
		if (!peer) throw new Error('peer not found');
		await peer.setRemoteDescription(sdp);
		if (sdp.type === 'offer') {
			const answer = await peer.createAnswer();
			peer.setLocalDescription(answer);
			return answer;
		}
		return null;
	}

	public async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
		const peer = this.getPeer(peerId);
		if (!peer) throw new Error('peer not found');
		if (!peer.localDescription) throw new Error(`peer local description not found`);
		await peer.addIceCandidate(candidate);
	}

	public setRemoteIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
		let tryCount = 0;
		const addIceCandidate = async () => {
			try {
				await this.addIceCandidate(peerId, candidate);
			} catch (error) {
				setTimeout(() => {
					++tryCount < 10 ? addIceCandidate() : console.error('invalid peer state');
				}, 1000);
			}
		};
		addIceCandidate();
	}

	public muteStream(id: string, kind: 'audio' | 'video', mute = true) {
		const peer = this.getPeer(id);
		if (!peer) throw new Error('peer not found');
		const senders = peer.getSenders();
		senders.forEach(sender => {
			if (sender.track?.kind === kind) {
				sender.track.enabled = !mute;
			}
		});
	}

	public clear() {
		while (this.peerList.size > 0) {
			this.removePeer(Array.from(this.peerList.keys())[0]);
		}
		this.peerList.clear();
	}
}
