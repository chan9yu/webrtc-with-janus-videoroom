/** @type {import("cz-customizable").Options} */
module.exports = {
	types: [
		{
			value: 'feat',
			name: `feat:     새로운 기능 추가`
		},
		{
			value: 'fix',
			name: 'fix:      버그 수정'
		},
		{
			value: 'docs',
			name: 'docs:     문서 수정'
		},
		{
			value: 'style',
			name: 'style:    코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우'
		},
		{
			value: 'refactor',
			name: 'refactor: 코드 리펙토링'
		},
		{
			value: 'test', //
			name: 'test:     테스트 코드, 리펙토링 테스트 코드 추가'
		},
		{
			value: 'chore',
			name: 'chore:    빌드 업무 수정, 패키지 매니저 수정'
		}
	],
	usePreparedCommit: false,
	allowTicketNumber: false,
	isTicketNumberRequired: false,
	messages: {
		type: '타입을 선택해 주세요:\n',
		subject: '제목을 입력해주세요 (제목은 50자 이내):\n',
		body: '본문내용을 입력해 주세요 (여러 줄 작성 시 "|"를 사용하여 줄바꿈 가능):\n',
		confirmCommit: '위의 커밋을 계속 진행하시겠습니까?\n'
	},
	allowCustomScopes: false,
	skipQuestions: ['scope', 'customScope', 'breaking', 'footer'],
	subjectLimit: 50,
	breaklineChar: '|',
	askForBreakingChangeFirst: false
};
