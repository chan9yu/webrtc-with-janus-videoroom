import { JANUS_PARTICIPANT_TYPE, JANUS_PLUGIN, JANUS_REQUEST, JANUS_REQUEST_TYPE, JSEP_TYPE } from './messageConstants';
import type { AttachPluginMessage } from './messageTypes';

export class JanusTransaction {
	private sessionId: string | null;
	private handleId: string | null;

	private generateTransactionId() {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 12; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return result;
	}

	/**
	 * Create Session Message
	 * - 전송 시점: 새로운 세션을 시작할 때
	 * - 의미: 새로운 세션을 생성
	 */
	public makeCreateSessionMessage() {
		return {
			janus: JANUS_REQUEST_TYPE.CREATE,
			transaction: this.generateTransactionId()
		};
	}

	/**
	 * Attach Plugin
	 * - 전송 시점: 새로운 비디오 룸 플러그인 세션을 시작할 때
	 * - 의미: 특정 세션에서 비디오 룸 플러그인에 연결
	 */
	public makeAttachPluginMessage(): AttachPluginMessage {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.ATTACH,
			plugin: JANUS_PLUGIN.VIDEOROOM,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId
		};
	}

	/**
	 * Create Room Message
	 * - 전송 시점: 새로운 비디오 룸을 생성할 때
	 * - 의미: 새로운 비디오 룸을 생성하고 설정을 지정
	 */
	public makeCreateRoomMessage(
		roomId: number,
		description: string,
		permanent: boolean,
		isPrivate: boolean,
		secret: string
	) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.CREATE,
				room: roomId,
				permanent: permanent,
				description: description,
				is_private: isPrivate,
				secret: secret
			}
		};
	}

	/**
	 * Join Room Message
	 * - 전송 시점: 기존 비디오 룸에 참가할 때
	 * - 의미: 특정 비디오 룸에 참가자로 가입
	 */
	public makeJoinRoomMessage(roomId: number, displayName: string, pin: string) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.JOIN,
				room: roomId,
				ptype: JANUS_PARTICIPANT_TYPE.PUBLISHER,
				display: displayName,
				pin: pin
			}
		};
	}

	/**
	 * Configure Message (비디오 및 오디오 설정)
	 * - 전송 시점: 비디오 및 오디오 설정을 변경할 때
	 * - 의미: 오디오와 비디오를 설정하거나 비트레이트를 변경
	 */
	public makeConfigureMessage(audio: boolean, video: boolean, bitrate: number) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.CONFIGURE,
				audio: audio,
				video: video,
				bitrate: bitrate
			}
		};
	}

	/**
	 * Leave Room Message
	 * - 전송 시점: 비디오 룸을 떠날 때
	 * - 의미: 현재 참가 중인 비디오 룸에서 나간다
	 */
	public makeLeaveRoomMessage() {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.LEAVE
			}
		};
	}

	/**
	 * Destroy Room Message
	 * - 전송 시점: 비디오 룸을 삭제할 때
	 * - 의미: 특정 비디오 룸을 삭제
	 */
	public makeDestroyRoomMessage(roomId: number, secret: string) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.DESTROY,
				room: roomId,
				secret: secret
			}
		};
	}

	/**
	 * Publish Message
	 * - 전송 시점: 비디오 룸에 미디어 스트림을 게시할 때
	 * - 의미: 비디오 룸에 자신의 미디어 스트림을 게시
	 */
	public makePublishMessage(audio: boolean, video: boolean, bitrate: number, sdp: string) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.PUBLISH,
				audio: audio,
				video: video,
				bitrate: bitrate
			},
			jsep: {
				type: JSEP_TYPE.OFFER,
				sdp: sdp
			}
		};
	}

	/**
	 * Subscribe Message
	 * - 전송 시점: 다른 참가자의 미디어 스트림을 구독할 때
	 * - 의미: 특정 참가자의 미디어 스트림을 구독
	 */
	public makeSubscribeMessage(feedId: number) {
		if (!this.sessionId) {
			throw new Error('need sessionId');
		}

		return {
			janus: JANUS_REQUEST_TYPE.MESSAGE,
			transaction: this.generateTransactionId(),
			session_id: this.sessionId,
			handle_id: this.handleId,
			body: {
				request: JANUS_REQUEST.SUBSCRIBE,
				streams: [{ feed: feedId }]
			}
		};
	}
}
