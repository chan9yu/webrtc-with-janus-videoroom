export class RTCManager {
	private peers: {
		[id: string]: RTCPeerConnection;
	};

	constructor() {
		this.peers = {};
	}

	public createPeerConnection(
		id: string,
		stream: MediaStream,
		onTrack: (event: RTCTrackEvent) => void,
		onIceCandidate: (candidate: RTCIceCandidate) => void
	) {
		const configuration: RTCConfiguration = {
			iceServers: [
				{
					urls: 'stun:stun.l.google.com:19302'
				}
			]
		};

		const pc = new RTCPeerConnection(configuration);

		stream.getTracks().forEach(track => pc.addTrack(track, stream));

		pc.onicecandidate = event => {
			if (event.candidate) {
				onIceCandidate(event.candidate);
			}
		};

		pc.ontrack = onTrack;

		this.peers[id] = pc;
		return pc;
	}

	public getPeerConnection(id: string) {
		return this.peers[id];
	}

	public removePeerConnection(id: string) {
		delete this.peers[id];
	}
}
