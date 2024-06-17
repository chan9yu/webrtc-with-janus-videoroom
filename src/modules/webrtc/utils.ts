/**
 * 사용자의 미디어 스트림을 가져오는 함수
 * @param constraints constraints
 * @returns 미디어 스트림
 */
export const getUserStream = async (constraints: MediaStreamConstraints) => {
	return await navigator.mediaDevices.getUserMedia(constraints);
};

/**
 * 사용자의 디스플레이 미디어 스트림을 가져오는 함수
 * @param constraints constraints
 * @returns 디스플레이 미디어 스트림
 */
export const getDisplayStream = async (constraints: MediaStreamConstraints) => {
	return await navigator.mediaDevices.getDisplayMedia(constraints);
};
