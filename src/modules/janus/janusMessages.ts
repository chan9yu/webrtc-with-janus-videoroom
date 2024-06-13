import { JANUS_PARTICIPANT_TYPE, JANUS_PLUGIN, JANUS_TYPE, JANUS_VIDEOROOM_REQUEST, JSEP_TYPE } from './constants';

function createTransactionId() {
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
export function makeCreateSessionMessage() {
	return {
		janus: JANUS_TYPE.CREATE,
		transaction: createTransactionId()
	};
}

/**
 * Attach Plugin
 * - 전송 시점: 새로운 비디오 룸 플러그인 세션을 시작할 때
 * - 의미: 특정 세션에서 비디오 룸 플러그인에 연결
 */
export function makeAttachPluginMessage(sessionId: string) {
	return {
		janus: JANUS_TYPE.ATTACH,
		plugin: JANUS_PLUGIN.VIDEOROOM,
		transaction: createTransactionId(),
		session_id: sessionId
	};
}

/**
 * Exists Message
 * - 전송 시점:
 * - 의미:
 */
export function makeExistsMessage(sessionId: string, handleId: string, body: { room: number }) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.EXISTS,
			...body
		}
	};
}

/**
 * Create Room Message
 * - 전송 시점: 새로운 비디오 룸을 생성할 때
 * - 의미: 새로운 비디오 룸을 생성하고 설정을 지정
 */
export function makeCreateRoomMessage(sessionId: string, handleId: string, body: { room: number }) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.CREATE,
			secret: 'adminpwd',
			publishers: 5,
			videocodec: 'h264,vp8',
			...body
		}
	};
}

/**
 * Join Room Message
 * - 전송 시점: 기존 비디오 룸에 참가할 때
 * - 의미: 특정 비디오 룸에 참가자로 가입
 */
export function makeJoinRoomMessage(sessionId: string, handleId: string, body: { room: number; displayName: string }) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.JOIN,
			ptype: JANUS_PARTICIPANT_TYPE.PUBLISHER,
			...body
		}
	};
}

/**
 * Configure Message (비디오 및 오디오 설정)
 * - 전송 시점: 비디오 및 오디오 설정을 변경할 때
 * - 의미: 오디오와 비디오를 설정하거나 비트레이트를 변경
 */
export function makeConfigureMessage(
	sessionId: string,
	handleId: string,
	body: { audio: boolean; video: boolean },
	jsep: { sdp: string }
) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.CONFIGURE,
			...body
		},
		jsep: {
			type: JSEP_TYPE.OFFER,
			...jsep
		}
	};
}

/**
 * Leave Room Message
 * - 전송 시점: 비디오 룸을 떠날 때
 * - 의미: 현재 참가 중인 비디오 룸에서 나간다
 */
export function makeLeaveRoomMessage(sessionId: string, handleId: string) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.LEAVE
		}
	};
}

/**
 * Destroy Room Message
 * - 전송 시점: 비디오 룸을 삭제할 때
 * - 의미: 특정 비디오 룸을 삭제
 */
export function makeDestroyRoomMessage(sessionId: string, handleId: string, body: { room: number; secret: string }) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.DESTROY,
			...body
		}
	};
}

/**
 * Publish Message
 * - 전송 시점: 비디오 룸에 미디어 스트림을 게시할 때
 * - 의미: 비디오 룸에 자신의 미디어 스트림을 게시
 */
export function makePublishMessage(
	sessionId: string,
	handleId: string,
	body: { audio: boolean; video: boolean },
	jsep: { sdp: string }
) {
	return {
		janus: JANUS_TYPE.MESSAGE,
		transaction: createTransactionId(),
		session_id: sessionId,
		handle_id: handleId,
		body: {
			request: JANUS_VIDEOROOM_REQUEST.PUBLISH,
			...body
		},
		jsep: {
			type: JSEP_TYPE.OFFER,
			...jsep
		}
	};
}
