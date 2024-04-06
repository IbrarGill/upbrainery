export class AttachmentDto {
  modelId: number;
  path: string;
  fileName: string;
  modelName: string;
  filetype: string | null;
  userId?: number
}


export class SmartDeskAttachmentDto {
  attachmentId: number;
  modelId: number;
  path: string;
  fileName: string;
  modelName: string;
  filetype: string | null;
}


export class NotificationsEventDto {
  receiver_user_id: number
  sender_user_id: number
  organization_id?: number
  user_id?: number
  type?: string
  notifiable_type?: string
  notifiable_id?: number
  data?: string
  is_seen?: boolean
  read_at?: boolean
}

export class sendingNotificationDto {
  userId: number
  url: string
  text: string
  is_seen: boolean
  read_at: string
  timestamp: Date
}


export class UserGalleryDto {
  userId: number;
  organizationId: number;
  availabilityId: number;
  filetypeId: number;
  path: string;
  fileName: string;
}

export class ARModel3Ddto {
  attachmentable_id: number;
  organizationId: number;
  path: string;
  fileName: string;
}