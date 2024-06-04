import { JanusClient } from '../modules/janus/JanusClient';

const janusClient = new JanusClient();

export default function HomePage() {
	const handleJanusConnect = () => {
		console.log('### janus join room');
		janusClient.joinRoom();
	};

	return (
		<div>
			<h1>Home Page</h1>
			<br />
			<button onClick={handleJanusConnect}>Connect</button>
		</div>
	);
}
