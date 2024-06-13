export enum JANUS_TYPE {
	/** 새로운 세션을 생성하는 요청 */
	CREATE = 'create',
	/** 기존 세션을 삭제하는 요청 */
	DESTROY = 'destroy',
	/** 특정 플러그인에 연결하는 요청 */
	ATTACH = 'attach',
	/** 플러그인에 메시지를 보내는 요청 */
	MESSAGE = 'message',
	/** ICE 후보를 보내는 요청 */
	TRICKLE = 'trickle',
	/** 플러그인 연결을 끊는 요청 */
	DETACH = 'detach',
	/** 세션을 유지하기 위한 요청 */
	KEEPALIVE = 'keepalive',
	/** 연결된 피어를 끊는 요청 */
	HANGUP = 'hangup'
}

export enum JANUS_PLUGIN {
	/** 에코 테스트 플러그인 */
	ECHOTEST = 'janus.plugin.echotest',
	/** 비디오 룸 플러그인 */
	VIDEOROOM = 'janus.plugin.videoroom',
	/** 스트리밍 플러그인 */
	STREAMING = 'janus.plugin.streaming',
	/** SIP 플러그인 */
	SIP = 'janus.plugin.sip',
	/** 텍스트 룸 플러그인 */
	TEXTROOM = 'janus.plugin.textroom',
	/** 음성 메일 플러그인 */
	VOICEMAIL = 'janus.plugin.voicemail'
}

export enum JANUS_VIDEOROOM_REQUEST {
	/** 새로운 방을 생성하는 요청 */
	CREATE = 'create',
	/** 기존 방을 삭제하는 요청 */
	DESTROY = 'destroy',
	/** 방 설정을 수정하는 요청 */
	EDIT = 'edit',
	/** 방의 존재 여부를 확인하는 요청 */
	EXISTS = 'exists',
	/** 사용 가능한 방 목록을 요청 */
	LIST = 'list',
	/** 방에 참가하는 요청 */
	JOIN = 'join',
	/** 참가자의 설정을 변경하는 요청 */
	CONFIGURE = 'configure',
	/** 미디어 스트림을 게시하는 요청 */
	PUBLISH = 'publish',
	/** 미디어 스트림 게시를 중지하는 요청 */
	UNPUBLISH = 'unpublish',
	/** 구독한 스트림 수신을 시작하는 요청 */
	START = 'start',
	/** 구독한 스트림 수신을 중지하는 요청 */
	PAUSE = 'pause',
	/** 방을 떠나는 요청 */
	LEAVE = 'leave',
	/** 다른 참가자의 미디어 스트림을 구독하는 요청 */
	SUBSCRIBE = 'subscribe'
}

export enum JANUS_PARTICIPANT_TYPE {
	PUBLISHER = 'publisher',
	SUBSCRIBER = 'subscriber'
}

export enum JANUS_RESPONSE {
	SUCCESS = 'success',
	ERROR = 'error',
	EVENT = 'event',
	INFO = 'info',
	OTHER = 'other'
}

export enum JSEP_TYPE {
	OFFER = 'offer',
	ANSWER = 'answer',
	PRANSWER = 'pranswer'
}
