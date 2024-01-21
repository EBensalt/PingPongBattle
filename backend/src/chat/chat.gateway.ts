import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { MESSAGE, NEWCHAT } from "./myTypes";
import { Logger, Req, UseGuards } from "@nestjs/common";
import JwtTwoFaGuard from "src/auth/guard/twoFaAuth.guard";
import { AuthService } from "src/auth/auth.service";
import { notifDto } from "src/auth/dto/notif.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtTwoFaStrategy } from "src/strategy";
import { UserService } from "src/user/user.service";

@WebSocketGateway({ cors: {
	origin: 'http://localhost:3000',
    credentials: true
} })
export class ChatGateway implements
OnGatewayConnection,
OnGatewayDisconnect {
	constructor(private chatService: ChatService, 
				private prisma: PrismaService, 
				private strategy: JwtTwoFaStrategy,
				private user: UserService) {}
	@WebSocketServer() server: Server
	@SubscribeMessage("direct")
	async handelMessage(client: Socket, data: MESSAGE) {
		const room = await this.chatService.getRoomDirect(data);
		if (room) {
			const message = await this.chatService.addMessagePrivate(data);
			this.server.to(room).emit("clientPrivate", message);
		}
		else {
			this.server.to(client.id).emit("chatError");
		}
	}
	@SubscribeMessage("room")
	async handelRoom(client: Socket, data: MESSAGE) {
		const room = await this.chatService.getRoomRoom(data);
		const message = await this.chatService.addMessageRoom(data);
		this.server.to(room).emit("clientRoom", message);
	}
	@SubscribeMessage("newChatPrivate")
	async handelNewChatPrivate(client: Socket, data: NEWCHAT) {
		Array
			.from(client.rooms)
			.slice(1)
			.forEach(room => client.leave(room));
		const room = await this.chatService.getRoomDirect(data);
		if (room)
			client.join(room);
	}
	@SubscribeMessage("newChatRoom")
	async handelNewChatRoom(client: Socket, data: NEWCHAT) {
		Array
			.from(client.rooms)
			.slice(1)
			.forEach(room => client.leave(room));
		const room = await this.chatService.getRoomRoom(data);
		client.join(room);
	}
	@SubscribeMessage("newUser")
	async handelUser(client: Socket, data: string) {
		const recver = await this.chatService.newMessage(data);
		const	{ username } = await this.chatService.whoIAm(client.id);
		this.server
			.to(recver)
			.emit("newuser", username);
	}
	handleConnection(client: Socket) {
		// console.log(client.handshake.headers.cookie);
	}
	async handleDisconnect(client: Socket) {
		Array
			.from(client.rooms)
			.slice(1)
			.forEach(room => client.leave(room));
        const	user = await this.chatService.dropUser(client);
		// const {username, state} = await this.verifyClient(client);
		if (user)
			client.broadcast.emit("online", {
				username: user.username,
				state: user.state
			});		
	}



	////////
	////////
	@SubscribeMessage('addnotification')
	async handleNotification(client: Socket, payload: notifDto) {
		try {	
			const {id} = await this.verifyClient(client);
	  		const reciever = await this.prisma.user.findUnique({
			where: {username: payload.reciever},
			select: {id: true, socket: true}
	  		})
	  		await this.user.addNotification(id, payload);
	  		client.to(reciever.socket).emit('getnotification', 'hello');
		} catch(error)
		{
			client.emit('error');
		}
	}
	@SubscribeMessage("state")
    async handleOnline(client: Socket) {
		try {
			const {username, state} = await this.verifyClient(client);
        	client.broadcast.emit("online", {username, state});
		} catch(error)
		{
			client.emit('error');
		}
    }
	async verifyClient(client: Socket) {
		try {
			const token = client.handshake.headers.cookie.split('jwt=')[1];
			const payload = await this.strategy.verifyToken(token);
            const user = await this.strategy.validate(payload)
            if (!user)
                throw new Error('invalid token');
			return (user);
		}
		catch (error) {
			client.emit('error', 'invalid token');
		}
	}
}
