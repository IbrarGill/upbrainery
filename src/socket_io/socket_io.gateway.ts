import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { SocketIoService } from './socket_io.service';
import { ChatGptDto, CreateSocketIoDto, DeleteMessageDto, HandRaisedDto, LoadChatMeassageDto, SendMessageDto, SessionDto, SessionReactDto, Typing, WatchingDto, addUserToChatListDto } from './dto/create-socket_io.dto';
import { Server, Socket } from 'socket.io';
import { UserSocketService } from './users/userSocketService';
import { ChatGptService } from 'src/services/openaiService';
import { NotificationsEventDto, sendingNotificationDto } from 'src/Events/event.dto';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketIoGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly socketIoService: SocketIoService,
    private SocketService: UserSocketService,
    private chatGptService: ChatGptService
  ) { }

  @SubscribeMessage('connection')
  connection(client: Socket) {
    console.log('User connection received with socket: ' + client.id);
  }



  @SubscribeMessage('AIChatGPT')
  async AIChatGPT(
    userId: number
  ) {
    try {
      let result = await this.socketIoService.getLastAsnwerFromAIBotCoversation(userId);
      let socketId = await this.SocketService.getUserSockets(userId)  // get user sockets
      this.server.to(socketId).emit('query_chat_gpt_response', result)
    } catch (error) {
      console.log(error)
    }
  }
  ///////////////////////////////////////////////////////////////////

  @SubscribeMessage('addUser')
  async create(
    @MessageBody() user: CreateSocketIoDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.socketsJoin(user?.userId?.toString());
    await this.SocketService.addUserSocket(user.userId, client.id)
  }

  @SubscribeMessage('removeUser')
  async removeUser(
    @MessageBody() user: CreateSocketIoDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.socketsLeave(user.userId.toString());
    this.SocketService.removeUserSocket(user.userId, client.id)

  }


  @SubscribeMessage('join_session')
  async join_session(
    @MessageBody() dto: SessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.socketsJoin(dto.session_name);
    let session = await this.socketIoService.addlearnertosession(dto);
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }

  @SubscribeMessage('remove_session')
  async remove_session(
    @MessageBody() dto: SessionDto
  ) {
    this.server.socketsLeave(dto.session_name);
    let session = await this.socketIoService.removeSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }
  //===================watch events=============================
  @SubscribeMessage('hand_raised')
  async hand_raised_session(
    @MessageBody() dto: HandRaisedDto,
  ) {
    let session = await this.socketIoService.handRaisedInSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }

  @SubscribeMessage('drop_raised_hand')
  async drop_hand_raised_session(
    @MessageBody() dto: HandRaisedDto,
  ) {
    let session = await this.socketIoService.dropHandRaisedInSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }

  //===================React in Session============================
  @SubscribeMessage('reactInSession')
  async reactInSession(
    @MessageBody() dto: SessionReactDto,
  ) {
    let session = await this.socketIoService.learnersReactionInSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }
  //===================watch events=============================
  @SubscribeMessage('startWatching')
  async startWatching(
    @MessageBody() dto: WatchingDto,
  ) {
    let session = await this.socketIoService.learnerStartWatchingInSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }

  @SubscribeMessage('stopWatching')
  async stopWatching(
    @MessageBody() dto: WatchingDto,
  ) {
    let session = await this.socketIoService.learnerStopWatchingInSession(dto)
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    this.server.to(sessionLearnerSocket).emit('session', session)
  }
  //========================================================================

  @SubscribeMessage('send_message')
  async send_message_in_session(
    @MessageBody() dto: SendMessageDto,
  ) {
    let sessionLearnerSocket = await this.socketIoService.getallsocketlistinsessin(dto.session_id)
    let message = {
      userId: dto.user_id,
      username: dto.user_name,
      text: dto.message,
      timestamp: dto.timestamp
    }
    this.server.to(sessionLearnerSocket).emit('session_chat', message)
  }

  @SubscribeMessage('onlineUser')
  async onlineUsers() {
    this.server.emit('onlineUser', '');// to be set later
  }
  //=========================================Smart desk AI Bot ==================================================

  @SubscribeMessage('query_chat_gpt')
  async queryChatGPT(
    @MessageBody() dto: ChatGptDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      let result = await this.chatGptService.getModelAnswer(dto.question)
      await this.socketIoService.saveasnwerfromchatgpt(dto.user_id, dto.question, result.content);
      let socketId = await this.SocketService.getUserSockets(dto.user_id)  // get user sockets
      this.server.to(socketId).emit('query_chat_gpt_response', result)
    } catch (error) {
      console.log(error)
    }
  }

  // @SubscribeMessage('AI_query_chat_gpt')
  // async AIChatGPT(
  //   @MessageBody() userId: number
  // ) {
  //   try {
  //     console.log('inside AI_query_chat_gpt',userId)
  //     let result = await this.socketIoService.getLastAsnwerFromAIBotCoversation(userId);
  //     let socketId = this.SocketService.getUserSockets(userId.toString())  // get user sockets
  //     this.server.to(socketId).emit('query_chat_gpt_response', result)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  //=========================================Brain lab chat==================================================

  @SubscribeMessage('loadUserChat')
  async loadUserChat(@MessageBody() userId: number) {

    let ChatList = await this.socketIoService.loadUserChat(userId);
    let socketId = await this.SocketService.getUserSockets(userId)  // get user sockets
    this.server.to(socketId).emit('loadUserChat', ChatList);
  }

  @SubscribeMessage('send')
  async sendMessage(@MessageBody() message: addUserToChatListDto) {
    let isMessageCreated =
      await this.socketIoService.sendMessageOrSaveMessageToDb(message);
    this.server
      .to([
        message.reciever.userId.toString(),
        message.sendar.userId.toString(),
      ])
      .emit('recieve', isMessageCreated);

    let notification = await this.socketIoService.saveNotificationTodbAndSendThourghSocket(message.reciever.userId, message.text, message.sendar.userId)
    this.sendNotification(notification) // get user sockets
  }

  @SubscribeMessage('Typing')
  async Typing(@MessageBody() data: Typing) {
    let socketId = await this.SocketService.getUserSockets(data.userId)  // get user sockets
    this.server.to(socketId).emit('Typing', data.status);
  }

  @SubscribeMessage('LoadChatMessage')
  async remove(@MessageBody() dto: LoadChatMeassageDto, client: Socket) {
    let messages = await this.socketIoService.getMessages(dto.chatId);
    let socketId = await this.SocketService.getUserSockets(dto.userId)  // get user sockets
    this.server.to(socketId).emit('LoadChatMessage', messages);
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(@MessageBody() dto: DeleteMessageDto) {
    await this.socketIoService.deleteMessageFromchat(dto);
  }

  @SubscribeMessage('deleteChat')
  async deleteChat(@MessageBody() chatId: number) {
    await this.socketIoService.deleteChat(chatId);
  }
  //=========================================================================================================

  //======================================Notifications======================================================
  // @SubscribeMessage('send_notification')
  async sendNotification(notification: sendingNotificationDto) {
    let socketId = await this.SocketService.getUserSockets(notification.userId)  // get user sockets
    this.server.to(socketId).emit('notification', notification);
  }
}