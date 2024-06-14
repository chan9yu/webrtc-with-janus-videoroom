import { EventEmitter } from 'events';

export type TrackKind = 'video' | 'audio' | 'both';

export type ICEServerInfo = {
	urls: string;
	username: string;
	credential: string;
};

export class RTCManager extends EventEmitter {
	private peer: RTCPeerConnection | null = null;
	private sourceStream?: MediaStream;

	public readonly peerId: string;

	constructor(peerId: string, options?: RTCConfiguration) {
		super();
		this.peer = new RTCPeerConnection(options);
		this.peerId = peerId;
		this.initPeerEvents();
	}

	private initPeerEvents() {
		const peer = this.peer;
		if (!peer) throw new Error('peer not found');

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

	private getPeer() {
		const peer = this.peer;
		if (!peer) throw new Error('peer not found');
		return peer;
	}

	private replaceSenderTrack(stream: MediaStream, kind: TrackKind) {
		const peer = this.getPeer();
		const track = kind === 'video' ? this.sourceStream?.getVideoTracks()[0] : stream?.getAudioTracks()[0];

		if (track) {
			peer.getSenders().forEach(sender => {
				if (sender.track?.kind === kind) {
					sender.track.stop();
					sender.replaceTrack(track);
				}
			});
		}

		if (kind === 'both') {
			this.replaceSenderTrack(stream, 'video');
		}
	}

	public addTrack(stream: MediaStream) {
		const peer = this.getPeer();
		const senders = peer.getSenders();
		const sended = senders.length > 0 && senders[0].track;

		if (sended) {
			senders.forEach(sender => {
				if (sender.track) {
					this.replaceTrack(stream, (sender.track.kind as TrackKind) || 'both');
				}
			});
		} else {
			this.sourceStream = stream;
			const cloneStream = this.sourceStream.clone();
			cloneStream.getTracks().forEach(track => {
				peer.addTrack(track, stream);
			});
		}
	}

	public replaceTrack(stream: MediaStream, kind: TrackKind) {
		this.sourceStream?.getTracks().forEach(track => {
			if (kind === 'both' || track.kind === kind) {
				track.stop();
				this.sourceStream?.removeTrack(track);
			}
		});

		stream.getTracks().forEach(track => {
			if (kind === 'both' || track.kind === kind) {
				this.sourceStream?.addTrack(track);
			}
		});

		this.replaceSenderTrack(stream, kind);
	}

	public removeTrack(kind = 'both') {
		if (this.sourceStream) {
			this.sourceStream.getTracks().forEach(track => {
				if (kind === 'both' || track.kind === kind) {
					track.stop();
				}
			});

			if (this.sourceStream.getTracks().length <= 0) {
				delete this.sourceStream;
			}
		}
	}

	public muteStream(id: string, kind: 'audio' | 'video', mute = true) {
		const peer = this.getPeer();
		const senders = peer.getSenders();
		senders.forEach(sender => {
			if (sender.track?.kind === kind) {
				sender.track.enabled = !mute;
			}
		});
	}

	public async createOfferSDP(options?: RTCOfferOptions) {
		const peer = this.getPeer();
		const offer = await peer.createOffer(options);
		peer.setLocalDescription(offer);
		return offer;
	}

	public async setRemoteSDP(sdp: RTCSessionDescriptionInit) {
		const peer = this.getPeer();
		await peer.setRemoteDescription(sdp);
		if (sdp.type === 'offer') {
			const answer = await peer.createAnswer();
			peer.setLocalDescription(answer);
			return answer;
		}
		return null;
	}

	public setRemoteIceCandidate(candidate: RTCIceCandidateInit) {
		const peer = this.getPeer();
		if (!peer.localDescription) throw new Error(`peer local description not found`);

		let tryCount = 0;
		const addIceCandidate = async () => {
			try {
				await peer.addIceCandidate(candidate);
			} catch (error) {
				setTimeout(() => {
					++tryCount < 10 ? addIceCandidate() : console.error('invalid peer state');
				}, 1000);
			}
		};

		addIceCandidate();
	}

	public clear() {
		this.peer?.close();
		this.peer = null;
	}
}
