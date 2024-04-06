export class CreateSocketIoDto {
  userId: number
}

export class SessionDto {
  user_id: number;
  session_name: string;
  session_id: number;
}
export class HandRaisedDto {
  user_id: number;
  session_name: string;
  session_id: number;
}
export class WatchingDto {
  user_id: number;
  session_name: string;
  session_id: number;
}

export class SessionReactDto {
  user_id: number;
  session_name: string;
  session_id: number;
  reaction:string
}

export class SendMessageDto {
  user_id: number;
  user_name: string;
  session_name: string;
  session_id: number;
  message: string;
  timestamp: string;
}

export class ChatGptDto {
  user_id: number;
  question: string;
}

//============================chat dto====================================

export class UserDto {
  userId: number;
  username: string;
  origin: string;
}

export class Typing {
  userId: number;
  status: boolean;
}

export class MessageDto {
  sendId: number;
  receiverId: number;
  text: string;
}

export class addUserToChatListDto {
  sendar: UserDto;
  reciever: UserDto;
  text: string;
}

export class LoadChatMeassageDto {
  chatId: number;
  userId: number;
}

export class DeleteMessageDto {
  MessageId: number;
}
