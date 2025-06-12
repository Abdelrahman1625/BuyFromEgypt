export const NotificationTemplates = {
  like_post: {
    getMessage: ({ senderName }) => `${senderName} liked your post`,
    needs: ['senderName'],
  },
  comment_post: {
    getMessage: ({ senderName }) => `${senderName} commented on your post`,
    needs: ['senderName'],
  },
  like_comment: {
    getMessage: ({ senderName }) => `${senderName} liked your comment`,
    needs: ['senderName'],
  },
  follow_user: {
    getMessage: ({ senderName }) => `${senderName} started following you`,
    needs: ['senderName'],
  },
};
