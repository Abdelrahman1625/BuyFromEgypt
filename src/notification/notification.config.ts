export const NotificationTemplates = {
  rate_post: {
    getMessage: ({ senderName, rating }) => `${senderName} rated your post ${rating} star${rating > 1 ? 's' : ''}`,
    needs: ['senderName', 'rating'],
  },
  comment_post: {
    getMessage: ({ senderName }) => `${senderName} commented on your post`,
    needs: ['senderName'],
  },
  like_comment: {
    getMessage: ({ senderName }) => `${senderName} liked your comment`,
    needs: ['senderName'],
  },
  DISLIKE_COMMENT: {
    getMessage: ({ senderName }) => `${senderName} disliked your comment`,
    needs: ['senderName'],
  },
  follow_user: {
    getMessage: ({ senderName }) => `${senderName} started following you`,
    needs: ['senderName'],
  },
};
