import { Module } from '@nestjs/common';
import { SocketIoService } from './socket_io.service';
import { SocketIoGateway } from './socket_io.gateway';
import { UserSocketService } from './users/userSocketService';
import { ChatGptService } from 'src/services/openaiService';
import { CommonFunctionsService } from 'src/services/commonService';

@Module({
  providers: [SocketIoGateway, SocketIoService,UserSocketService,ChatGptService,CommonFunctionsService]
})
export class SocketIoModule {}
