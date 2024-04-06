import { Injectable } from '@nestjs/common';
import { CreateSocketIoDto, DeleteMessageDto, HandRaisedDto, SessionDto, SessionReactDto, UserDto, addUserToChatListDto } from './dto/create-socket_io.dto';
import { PrismaService } from 'src/prisma/prisma.client';
import { ChatGptService } from 'src/services/openaiService';
import { PrismaClient } from '@prisma/client';
import { NotificationsEventDto } from 'src/Events/event.dto';
import { CommonFunctionsService } from 'src/services/commonService';
const prismaClientservice = new PrismaClient();

@Injectable()
export class SocketIoService {
  constructor(private prisma: PrismaService,
    private chatGptService: ChatGptService,
    private commonService: CommonFunctionsService
  ) { }


  //===================================smarkdesk session================================================

  async addlearnertosession(dto: SessionDto) {
    try {

      return this.createOrFindSmartSession(dto)

    } catch (error) {
      console.log(error)
    }
  }

  async removeSession(dto: SessionDto) {
    try {

      let session = await this.prisma.smartdesk_sessions.findFirst({
        where: {
          session_id: dto.session_id
        },
      })

      let user_id = await this.getlearnerIdinSession(dto)

      let findsocketlearnersession = await this.prisma.socket_learner_sessions.findFirst({
        where: {
          smartdesk_session_id: session.id,
          socket_learner_id: user_id
        }
      })

      if (findsocketlearnersession) {
        await this.prisma.socket_learner_sessions.delete({
          where: {
            id: findsocketlearnersession.id
          },
        })
        await this.prisma.socket_learners.delete({
          where: {
            id: user_id
          },
        })
      }

      return await this.getsessionDetails(dto.session_id)

    } catch (error) {
      console.log(error)
    }
  }

  async getlearnerIdinSession(dto: SessionDto) {
    try {
      let sessionFound = await this.prisma.smartdesk_sessions.findFirst({
        where: {
          session_id: dto.session_id,
          socket_learner_sessions: {
            some: {
              socket_learners: {
                user_id: dto.user_id
              }
            }
          }
        },
        select: {
          socket_learner_sessions: {
            select: {
              socket_learners: true
            }
          },
        }
      })

      if (sessionFound) {
        const filteredList = sessionFound?.socket_learner_sessions.filter(
          (item) => item.socket_learners.user_id === dto.user_id
        );

        return filteredList[0]?.socket_learners.id;
      } else {
        return null
      }


    } catch (error) {
      console.log(error)
    }
  }

  async handRaisedInSession(dto: SessionDto) {
    try {

      let userId = await this.getlearnerIdinSession(dto)
      if (userId) {
        await this.prisma.socket_learners.update({
          where: {
            id: userId
          },
          data: {
            handraised: true,
          }
        })
        return await this.getsessionDetails(dto.session_id)
      }

    } catch (error) {
      console.log(error)
    }
  }

  async dropHandRaisedInSession(dto: SessionDto) {
    try {
      let userId = await this.getlearnerIdinSession(dto)
      if (userId) {
        await this.prisma.socket_learners.update({
          where: {
            id: userId
          },
          data: {
            handraised: false,
          }
        })
        return await this.getsessionDetails(dto.session_id)
      }

    } catch (error) {
      console.log(error)
    }
  }

  async learnerStartWatchingInSession(dto: HandRaisedDto) {
    try {
      let userId = await this.getlearnerIdinSession(dto)
      if (userId) {
        await this.prisma.socket_learners.update({
          where: {
            id: userId
          },
          data: {
            is_watching: true,
          }
        })
        return await this.getsessionDetails(dto.session_id)
      }

    } catch (error) {
      console.log(error)
    }
  }

  async learnerStopWatchingInSession(dto: HandRaisedDto) {
    try {
      let userId = await this.getlearnerIdinSession(dto)
      if (userId) {
        await this.prisma.socket_learners.update({
          where: {
            id: userId
          },
          data: {
            is_watching: false,
          }
        })
        return await this.getsessionDetails(dto.session_id)
      }

    } catch (error) {
      console.log(error)
    }
  }

  async learnersReactionInSession(dto: SessionReactDto) {
    try {
      let userId = await this.getlearnerIdinSession(dto)
      if (userId) {
        await this.prisma.socket_learners.update({
          where: {
            id: userId
          },
          data: {
            learnerSessionFeeling: dto.reaction,
          }
        })
        return await this.getsessionDetails(dto.session_id)
      }

    } catch (error) {
      console.log(error)
    }
  }

  async createOrFindSmartSession(dto: SessionDto) {
    try {
      let learnerFound = await this.prisma.users.findUnique({
        where: {
          id: dto.user_id
        },
        select: {
          id: true,
          user_name: true,
        }
      })


      let isSmarkdeskSessionExit = await this.prisma.smartdesk_sessions.findFirst({
        where: {
          session_id: dto.session_id
        },
      })
      if (isSmarkdeskSessionExit) {

        let ExistLearner = await this.getsessionAllLearnerIds(dto.session_id)

        if (!ExistLearner.includes(dto.user_id)) {
          let learner = await this.prisma.socket_learners.create({
            data: {
              user_id: dto.user_id,
              name: learnerFound.user_name,
              handraised: false,
              is_watching: false,
              learnerSessionFeeling: 'Happy',
              is_session_join: true,
            },
          })

          await this.prisma.socket_learner_sessions.create({
            data: {
              socket_learner_id: learner.id,
              smartdesk_session_id: isSmarkdeskSessionExit.id
            },
          })
        }



        return await this.getsessionDetails(dto.session_id)
      } else {

        let session = await this.prisma.smartdesk_sessions.create({
          data: {
            session_id: dto.session_id,
            session_name: dto.session_name
          },
        })

        let learner = await this.prisma.socket_learners.create({
          data: {
            user_id: dto.user_id,
            name: learnerFound.user_name,
            handraised: false,
            is_watching: false,
            learnerSessionFeeling: 'Happy',
            is_session_join: true,
          },
        })


        await this.prisma.socket_learner_sessions.create({
          data: {
            socket_learner_id: learner.id,
            smartdesk_session_id: session.id
          },
        })

        return await this.getsessionDetails(dto.session_id)

      }

    } catch (error) {
      console.log(error)
    }
  }

  async getsessionDetails(session_id: number) {
    let session_learnes = await this.prisma.smartdesk_sessions.findFirst({
      where: {
        session_id: session_id
      },
      select: {
        socket_learner_sessions: {
          select: {
            id: true,
            smartdesk_session_id: true,
            socket_learners: {
              select: {
                id: true,
                user_id: true,
                name: true,
                handraised: true,
                is_watching: true,
                learnerSessionFeeling: true,
                is_session_join: true,
                users: {
                  select: {
                    account_types: {
                      select: {
                        id: true,
                        name: true,
                      }
                    },
                  }
                }
              }
            }
          }
        }
      }
    })

    let participants = [];
    for (const item of session_learnes.socket_learner_sessions) {
      const attachments = await this.commonService.getAttachments(
        item?.socket_learners.user_id,
        "User"
      );
      let learner = {
        id: item?.socket_learners.id,
        user_id: item?.socket_learners.user_id,
        name: item?.socket_learners.name,
        handraised: item?.socket_learners.handraised,
        is_watching: item?.socket_learners.is_watching,
        is_session_join: item?.socket_learners.is_session_join,
        learnerSessionFeeling: item?.socket_learners.learnerSessionFeeling,
        account_type: item?.socket_learners?.users.account_types,
        imageUrl: attachments?.path ?? 'https://img.freepik.com/free-icon/user_318-159711.jpg',
      }
      participants.push(learner)
    }

    return participants
  }

  async getsessionAllLearnerIds(session_id: number) {
    let session_learnes = await this.prisma.smartdesk_sessions.findFirst({
      where: {
        session_id: session_id
      },
      select: {
        socket_learner_sessions: {
          select: {
            id: true,
            smartdesk_session_id: true,
            socket_learners: {
              select: {
                id: true,
                user_id: true,
                name: true,
                handraised: true,
                is_watching: true,
                learnerSessionFeeling: true,
                is_session_join: true,
                users: {
                  select: {
                    user_sockets: {
                      select: {
                        socket_id: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    let learnerIds = [];
    for (const item of session_learnes.socket_learner_sessions) {
      learnerIds.push(item.socket_learners.user_id)
    }

    return learnerIds;
  }

  async getallsocketlistinsessin(session_id: number) {
    let session_learnes = await this.prisma.smartdesk_sessions.findFirst({
      where: {
        session_id: session_id
      },
      select: {
        socket_learner_sessions: {
          select: {
            id: true,
            smartdesk_session_id: true,
            socket_learners: {
              select: {
                id: true,
                user_id: true,
                name: true,
                handraised: true,
                is_watching: true,
                learnerSessionFeeling: true,
                is_session_join: true,
                users: {
                  select: {
                    user_sockets: {
                      select: {
                        socket_id: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    let sessionSocketList = [];
    for (const item of session_learnes.socket_learner_sessions) {
      for (const socket of item.socket_learners.users.user_sockets) {
        sessionSocketList.push(socket.socket_id)
      }
    }

    return sessionSocketList;
  }

  //====================================================================================================

  async findUserfromUserid(user_id: number) {
    return await this.prisma.users.findUnique({
      where: {
        id: user_id
      },
      select: {
        user_name: true,
        first_name: true,
        last_name: true
      }
    })
  }


  async saveasnwerfromchatgpt(
    user_id: number, question: string, answer: string
  ) {
    try {
      await this.prisma.chatbot_questions.create({
        data: {
          user_id: user_id,
          description: question,
          created_at: new Date().toISOString(),
          chatbot_question_answers: {
            create: {
              description: answer,
              created_at: new Date().toISOString(),
            }
          }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async getLastAsnwerFromAIBotCoversation(
    user_id: number,
  ) {
    try {

      let isLastQuestionExit = await prismaClientservice.chatbot_questions.findFirst({
        where: {
          user_id: user_id
        },
        orderBy: {
          created_at: 'desc'
        },
        select: {
          user_id: true,
          description: true,
          chatbot_question_answers: {
            select: {
              description: true
            }
          }
        }
      })
      if (isLastQuestionExit) {

        let result = await this.chatGptService.getModelAnswer(isLastQuestionExit.chatbot_question_answers[0].description + 'Give me alternate asnwers')
        return result
      } else {

        let result = await this.chatGptService.getModelAnswer('Help Me!!')
        return result;
      }

    } catch (error) {
      console.log(error)
    }
  }


  async saveNotificationTodbAndSendThourghSocket(user_id: number, text: string, senderID: number) {
    try {
      let notifiable_User = await prismaClientservice.users.findUnique({
        where: {
          id: user_id
        },
      })

      let sender = await prismaClientservice.users.findUnique({
        where: {
          id: senderID
        },
      })

      let attachment = await this.commonService.getAttachments(
        notifiable_User.id, 'User'
      )

      let isSave = await prismaClientservice.notifications.create({
        data: {
          user_id: user_id,
          organization_id: notifiable_User.organization_id ?? null,
          type: 'Message',
          notifiable_type: 'User',
          notifiable_id: user_id,
          data: `${sender.user_name} texted you ${text}`,
          is_seen: 0,
          read_at: null,
          created_at: new Date().toISOString()
        }
      })

      let user_notification = {
        userId: user_id,
        url: attachment?.path ?? null,
        text: text,
        is_seen: false,
        read_at: '',
        timestamp: isSave.created_at
      }
      return user_notification;
    } catch (error) {
      console.log(error)
    }
  }

  //================================== Brain lab chat=========================================================

  async loadUserChat(userId: number) {
    try {

      let UserChatList = await this.prisma.chats.findMany({
        orderBy: {
          created_at: 'desc',
        },
        distinct: ['id'],
        where: {
          OR: [{ reciever_id: userId }, { user_id: userId }],
        },
        include: {
          messages: {
            take: 1,
            orderBy: {
              timeStamp: 'desc',
            },
          },
        },
      });
      let tempChatList = [];
      if (UserChatList) {
        for (let index = 0; index < UserChatList.length; index++) {
          const element = UserChatList[index];

          const sendar = await this.prisma.users.findFirst({
            where: {
              id: element.user_id,
            },
            select: {
              id: true,
              user_name: true,
            },
          });

          const reciever = await this.prisma.users.findFirst({
            where: {
              id: element.reciever_id,
            },
            select: {
              id: true,
              user_name: true,
            },
          });

          let list = {
            chatId: element.id,
            reciever: userId == reciever.id ? sendar : reciever,
            LastMessage: element?.messages[0]?.text ?? '',
            timeStamp: new Date(element?.messages[0]?.timeStamp) ?? '',
            userId: element.user_id,
          };
          tempChatList.push(list);
        }
      }
      tempChatList.sort((a, b) => b.timeStamp - a.timeStamp);

      return tempChatList;
    } catch (error) {
      console.log(error);
    }
  }

  async addUserToChatList(dto: addUserToChatListDto) {

    let chatExistsBefore = await this.prisma.chats.findFirst({
      where: {
        AND: [
          {
            OR: [{ user_id: dto.sendar.userId }, { reciever_id: dto.sendar.userId }],
          },
          {
            OR: [{ user_id: dto.reciever.userId }, { reciever_id: dto.reciever.userId }],
          },
        ],
      },
    });
    if (chatExistsBefore) {
      return chatExistsBefore;
    } else {
      const chat = await this.prisma.chats.create({
        data: {
          user_id: dto.sendar.userId,
          reciever_id: dto.reciever.userId,
        },
      });
      if (chat) {
        return chat;
      }
    }
  }

  async sendMessageOrSaveMessageToDb(dto: addUserToChatListDto) {

    let chat = await this.addUserToChatList(dto);
    if (chat) {
      let isMessageCreated = await this.prisma.messages.create({
        data: {
          text: dto.text,
          sendar_id: dto.sendar.userId,
          recipient_id: dto.reciever.userId,
          chat_id: chat.id,
          timeStamp: new Date().toISOString()
        },
        select: {
          id: true,
          sendar_id: true,
          recipient_id: true,
          chat_id: true,
          text: true,
          timeStamp: true,
        },
      });
      if (isMessageCreated) {
        return isMessageCreated;
      }
    }
  }

  async getMessages(chatId: number) {
    console.log('chatId', chatId);
    const chat = await this.prisma.chats.findUnique({
      where: { id: chatId },
      select: {
        messages: {
          orderBy: {
            timeStamp: 'asc',
          },
          take: 200,
          select: {
            id: true,
            sendar_id: true,
            recipient_id: true,
            chat_id: true,
            text: true,
            timeStamp: true,
          },
        },
      },
    });
    return chat.messages;
  }

  async deleteMessageFromchat(dto: DeleteMessageDto) {
    try {
      let isDeleted = await this.prisma.messages.delete({
        where: {
          id: dto.MessageId,
        },
      });
      if (isDeleted) {
        console.log('Message Deleted!!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteChat(chatId: number) {
    try {
      let isDeleted = await this.prisma.chats.delete({
        where: {
          id: chatId,
        },
      });
      if (isDeleted) {
        console.log('Chat Deleted!!');
      }
    } catch (error) {
      console.log(error);
    }
  }



}
