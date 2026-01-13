// Notification utility functions
import { supabase } from "./supabase";

/**
 * Create a notification in the database
 * @param {string} userId - The user who will receive the notification
 * @param {string} type - Type of notification (mate_request, mate_accepted, activity_invite, activity_joined, activity_left)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} relatedUserId - ID of the user who triggered the notification (optional)
 * @param {string} relatedActivityId - ID of the related activity (optional)
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedUserId = null,
  relatedActivityId = null,
}) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      related_user_id: relatedUserId,
      related_activity_id: relatedActivityId,
      is_read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (err) {
    console.error("Error in createNotification:", err);
  }
}

/**
 * Create notification when someone sends a mate request
 * @param {string} receiverId - User receiving the request
 * @param {string} requesterId - User sending the request
 * @param {string} requesterName - Name of the person sending the request
 */
export async function notifyMateRequest(
  receiverId,
  requesterId,
  requesterName
) {
  await createNotification({
    userId: receiverId,
    type: "mate_request",
    title: "New mate request",
    message: `${requesterName} wants to be your mate`,
    relatedUserId: requesterId,
  });
}

/**
 * Create notification when someone accepts a mate request
 * @param {string} requesterId - Original requester (who gets notified)
 * @param {string} accepterId - User who accepted the request
 * @param {string} accepterName - Name of the person who accepted
 */
export async function notifyMateAccepted(
  requesterId,
  accepterId,
  accepterName
) {
  await createNotification({
    userId: requesterId,
    type: "mate_accepted",
    title: "Mate request accepted",
    message: `${accepterName} accepted your mate request`,
    relatedUserId: accepterId,
  });
}

/**
 * Create notification when someone invites you to an activity
 * @param {string} inviteeId - User being invited
 * @param {string} inviterId - User sending the invite
 * @param {string} inviterName - Name of the person sending the invite
 * @param {string} activityId - ID of the activity
 * @param {string} activityTitle - Title of the activity
 */
export async function notifyActivityInvite(
  inviteeId,
  inviterId,
  inviterName,
  activityId,
  activityTitle
) {
  await createNotification({
    userId: inviteeId,
    type: "activity_invite",
    title: "Activity invitation",
    message: `${inviterName} invited you to "${activityTitle}"`,
    relatedUserId: inviterId,
    relatedActivityId: activityId,
  });
}

/**
 * Create notification when someone joins your activity
 * @param {string} hostId - Activity creator (who gets notified)
 * @param {string} joinerId - User who joined
 * @param {string} joinerName - Name of the person who joined
 * @param {string} activityId - ID of the activity
 * @param {string} activityTitle - Title of the activity
 */
export async function notifyActivityJoined(
  hostId,
  joinerId,
  joinerName,
  activityId,
  activityTitle
) {
  // Don't notify if the host is joining their own activity
  if (hostId === joinerId) return;

  await createNotification({
    userId: hostId,
    type: "activity_joined",
    title: "Someone joined your activity",
    message: `${joinerName} joined your "${activityTitle}" activity`,
    relatedUserId: joinerId,
    relatedActivityId: activityId,
  });
}

/**
 * Create notification when someone leaves your activity
 * @param {string} hostId - Activity creator (who gets notified)
 * @param {string} leaverId - User who left
 * @param {string} leaverName - Name of the person who left
 * @param {string} activityId - ID of the activity
 * @param {string} activityTitle - Title of the activity
 */
export async function notifyActivityLeft(
  hostId,
  leaverId,
  leaverName,
  activityId,
  activityTitle
) {
  // Don't notify if the host is leaving their own activity
  if (hostId === leaverId) return;

  await createNotification({
    userId: hostId,
    type: "activity_left",
    title: "Someone left your activity",
    message: `${leaverName} left your "${activityTitle}" activity`,
    relatedUserId: leaverId,
    relatedActivityId: activityId,
  });
}
