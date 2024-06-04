export class JanusClient {
	private websocket?: WebSocket | null;
	private janusServer = 'wss://janus.conf.meetecho.com/ws';

	constructor() {}

	private connectJanus() {
		this.websocket = new WebSocket(this.janusServer, 'janus-protocol');
	}

	public joinRoom() {
		this.connectJanus();
	}
}
