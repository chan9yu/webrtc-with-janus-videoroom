/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';

export enum WEB_SOCKET_EVENTS {
	ON_OPEN = 'ON_OPEN',
	ON_MESSAGE = 'ON_MESSAGE',
	ON_ERROR = 'ON_ERROR',
	ON_CLOSE = 'ON_CLOSE'
}

export class SocketManager extends EventEmitter {
	private ws: WebSocket;

	constructor(server: string, protocol: string) {
		super();
		this.ws = new WebSocket(server, protocol);
		this.initWebSocketEvents();
	}

	private initWebSocketEvents() {
		this.ws.onopen = () => {
			console.log('SocketManager::socket event on open');
			this.emit(WEB_SOCKET_EVENTS.ON_OPEN);
		};

		this.ws.onmessage = msg => {
			console.log('SocketManager::socket event on message');
			this.emit(WEB_SOCKET_EVENTS.ON_MESSAGE, msg);
		};

		this.ws.onerror = error => {
			console.log('SocketManager::socket event on error');
			this.emit(WEB_SOCKET_EVENTS.ON_ERROR, error);
		};

		this.ws.onclose = () => {
			console.log('SocketManager::socket event on close');
			this.emit(WEB_SOCKET_EVENTS.ON_CLOSE);
		};
	}

	public send(message: any) {
		this.ws.send(JSON.stringify(message));
	}
}
