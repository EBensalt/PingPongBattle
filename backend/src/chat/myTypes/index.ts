export interface User {
	id:		number,
	login:	string,
	avatar?: string
}

export interface USERDATA {
	userName: string,
	chatUsers: User[],
	friends: User[]
}

export interface MESSAGE extends NEWCHAT {
	message: string
}

export interface NEWCHAT {
	sender: string
	recver: string
}

export interface NEWGROUP {
	name: string,
	state: string,
	password: string,
	owner: string
}
