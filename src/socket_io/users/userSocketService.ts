import { Injectable } from '@nestjs/common';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
@Injectable()
export class UserSocketService {


  // Create: Add a socket ID to the user's list
  async addUserSocket(userId: number, socketId: string) {
    await prisma.user_sockets.create({
      data: {
        user_id: userId,
        socket_id: socketId
      }
    })
  }

  // Read: Get the list of socket IDs for a user
  async getUserSockets(userId: number) {
    let learnerSockets = await prisma.user_sockets.findMany({
      where: {
        user_id: userId
      },
      select: {
        socket_id: true
      }
    })
    let socketList: string[] = []
    socketList = learnerSockets.map((sockets) => sockets.socket_id);
    return socketList
  }


  // Delete: Remove a socket ID from the user's list
  async removeUserSocket(userId: number, socketId: string) {

    let learnerSocket = await prisma.user_sockets.findFirst({
      where: {
        user_id: userId,
        socket_id: socketId
      }
    })

    await prisma.user_sockets.delete({
      where: {
        id: learnerSocket.id
      }
    })
  }
}

