import { INotification, notificationModel } from "../models/notification";

export const notificationType = {
  FOLLOW_REQUEST: "follow-request",
  INVITE_REQUEST: "invite-request",
  ACHIEVEMENT: "follow-request",
};

export const createNotificationService = async ({
  userIds,
  from,
  type,
  content,
  workoutId,
}: {
  userIds: string[];
  from: string;
  type: string;
  content: string;
  workoutId?: string;
}): Promise<void> => {
  let data: Array<{
    userId: string;
    type: string;
    content: string;
    from: string;
    workoutId?: string;
  }> = [];
  if (userIds.length > 1) {
    userIds.forEach((id) => {
      data = [
        ...data,
        {
          userId: id,
          type,
          content,
          from,
          workoutId,
        },
      ];
    });
    await notificationModel.insertMany(data);
  } else {
    await notificationModel.create({
      userId: userIds[0],
      type,
      content,
      from,
    });
  }
};
