import { JANUS_PLUGIN, JANUS_TYPE } from './messageConstants';

export type AttachPluginMessage = {
	janus: JANUS_TYPE.ATTACH;
	plugin: JANUS_PLUGIN.VIDEOROOM;
	transaction: string;
	session_id: string;
};
