import { UserPresenceEvents } from 'meteor/konecty:user-presence';

import { settings } from '../../../app/settings/server';
import { api } from '../../../server/sdk/api';

// mirror of object in /imports/startup/client/listenActiveUsers.js - keep updated
export const STATUS_MAP = {
	offline: 0,
	online: 1,
	away: 2,
	busy: 3,
};

export const setUserStatus = (user, status/* , statusConnection*/) => {
	const {
		_id: uid,
		username,
		statusText,
	} = user;

	// since this callback can be called by only one instance in the cluster
	// we need to broadcast the change to all instances
	api.broadcast('userpresence', { user: { status, _id: uid, username, statusText } }); // remove username
};

let TroubleshootDisablePresenceBroadcast;
settings.get('Troubleshoot_Disable_Presence_Broadcast', (key, value) => {
	if (TroubleshootDisablePresenceBroadcast === value) { return; }
	TroubleshootDisablePresenceBroadcast = value;

	if (value) {
		return UserPresenceEvents.removeListener('setUserStatus', setUserStatus);
	}

	UserPresenceEvents.on('setUserStatus', setUserStatus);
});
