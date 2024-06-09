import { JANUS_PLUGIN, JANUS_REQUEST_TYPE } from './messageConstants';

export type AttachPluginMessage = {
	janus: JANUS_REQUEST_TYPE.ATTACH;
	plugin: JANUS_PLUGIN.VIDEOROOM;
	transaction: string;
	session_id: string;
};
