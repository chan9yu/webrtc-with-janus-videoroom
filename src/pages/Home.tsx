import { AppService } from '../services/AppService';

const appsService = new AppService();

export default function HomePage() {
	const handleConnectJanus = () => {
		appsService.connectJanus();
	};

	const handleCreateRoom = () => {
		appsService.createRoom();
	};

	const handleJoinRoom = () => {
		appsService.joinRoom('옥분이');
	};

	return (
		<div className="container">
			<h1>Janus 1:n Video Room TEST</h1>
			<button onClick={handleConnectJanus}>1. connectJanus</button>
			<br />
			<button onClick={handleCreateRoom}>3. create Room</button>
			&nbsp;
			<button onClick={handleJoinRoom}>4. join Room</button>
		</div>
	);
}
