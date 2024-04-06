import { Injectable } from "@nestjs/common";
import { EventService } from "./event.service";
import { OnEvent } from "@nestjs/event-emitter";
import { ARModel3Ddto, AttachmentDto, NotificationsEventDto, SmartDeskAttachmentDto, UserGalleryDto } from "./event.dto";
import { InstructorList } from "src/instructor/contents/session/dto/create-session.dto";
import { UpdateInstructorList } from "src/instructor/contents/session/dto/update-session.dto";

@Injectable()
export class EventListener {
  constructor(private readonly eventService: EventService) { }

  @OnEvent("event.attachment")
  handleFileAttachmentEvent(event: AttachmentDto) {
    this.eventService.uploadAttachmentTOS3Bucket(event);
  }

  @OnEvent("event.updateattachment")
  handleFileUpdateAttachmentEvent(event: AttachmentDto) {
    this.eventService.updatefileAttachment(event);
  }

  @OnEvent("event.Defaultattachment")
  handleDefaultAttachmentEvent(event: AttachmentDto) {
    this.eventService.saveDefaultAttachment(event);
  }

  @OnEvent("event.smartDeskAttachment")
  smartDeskAttachment(event: SmartDeskAttachmentDto) {
    this.eventService.saveSmartDeskAttachment(event);
  }

  //=================save course detail to user schedules============
  @OnEvent("event.saveCourseDetailToUserSchedules")
  saveCourseDetailToUserSchedules(sessionId: number) {
    this.eventService.saveCourseDetailToUserSchedules(sessionId);
  }

  //=================Save Notification===============================
  @OnEvent("event.savenofication")
  savenofication(dto: NotificationsEventDto) {
    this.eventService.saveNotifcationToDB(dto);
  }

  //=================New Notification===============================
  @OnEvent("event.savenewnofication")
  notifications(dto: NotificationsEventDto) {
    this.eventService.newNotifcationToDB(dto);
  }

  //=================user gallery====================================
  @OnEvent("event.usergallery")
  handleusergalleryattachment(event: UserGalleryDto) {
    this.eventService.handleusergalleryattachment(event);
  }

  //=================user gallery====================================
  @OnEvent("event.ARModel3D")
  ARModel3D(event: ARModel3Ddto) {
    this.eventService.ARModel3D(event);
  }

  //=================update user session progress====================
  @OnEvent("event.updatelearnerprogress")
  updateusersessionprogress(courseId: number, learnerId: number, content_session_id: number) {
    this.eventService.updateusersessionprogress(courseId, learnerId, content_session_id);
  }

  //=================course ,activity and interactive assignment====================
  @OnEvent("event.sessionassignment")
  sessionassignment(sessionId: number, instructorIds: InstructorList[], content_session_id: number) {
    this.eventService.sessionassignment(sessionId, instructorIds, content_session_id);
  }

  //=================course ,activity and interactive assignment update====================
  @OnEvent("event.updatesessionassignment")
  updatesessionassignment(sessionId: number, instructorIds: UpdateInstructorList[]) {
    this.eventService.updatesessionassignment(sessionId, instructorIds);
  }
}
