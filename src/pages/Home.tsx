import { AppService } from '../services/AppService';

new AppService();

export default function HomePage() {
	return (
		<div className="container">
			<h1>Janus 1:n Video Room</h1>
			<video id="localVideo" autoPlay muted></video>
			<div id="remoteVideos"></div>
		</div>
	);
}
