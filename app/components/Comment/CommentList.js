import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {deleteApiReq, postAuthReq} from '../../utils/apiHandlers';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Heart from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import Constant from '../../utils/constant';
import CommentOptionsDialog from '../Modal/CommentOptionsDialog';

// Component for the comment text with @ mention parsing
const CommentTextContent = ({text}) => {
  const parts = text.split(/(\B@\w+)/g);
  return (
    <Text style={styles.commentText}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <Text key={index} style={styles.mentionText}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// Comment item component
const CommentItem = ({
  comment,
  currentUser,
  isReaction,
  handleCommentLikeDislike,
  replyOnComment,
  handleLongPressStart,
  handleLongPressEnd,
  handleNavigate,
  timeAgo,
  menuVisible,
  menuCommentId,
}) => {
  const {optimizeImageKitUrl} = Constant();
  return (
    <TouchableWithoutFeedback
      onLongPress={e =>
        currentUser?.id === comment?.userId &&
        handleLongPressStart(e, comment.id, comment?.comment)
      }
      onPressOut={handleLongPressEnd}
      delayLongPress={500}>
      <View
        style={[
          styles.commentItem,
          menuVisible && menuCommentId !== comment?.id && styles.blurredItem,
        ]}>
        <View style={styles.commentContentContainer}>
          {/* Profile Image */}
          <TouchableOpacity
            onPress={() => handleNavigate(comment?.user)}
            style={styles.profileImageContainer}>
            <FastImage
              source={
                comment?.user?.profileImage
                  ? {
                      uri: optimizeImageKitUrl(
                        comment?.user?.profileImage,
                        200,
                        200,
                      ),
                    }
                  : require('../../../public/images/dpPlaceholder.png')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Username & Comment */}
          <View style={styles.commentTextContainer}>
            <TouchableOpacity
              style={{alignSelf: 'flex-start'}}
              onPress={() => handleNavigate(comment?.user)}>
              <Text style={styles.usernameText}>
                {comment?.user?.username || comment?.user?.firstname}{' '}
                <Text style={styles.timeAgoText}>
                  {timeAgo(comment?.createdAt)}
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.commentContent}>
              <CommentTextContent text={comment?.comment} />
            </View>

            <TouchableOpacity
              onPress={() =>
                replyOnComment(comment?.user?.username, comment?.id)
              }
              style={styles.replyButton}>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Like Icon */}
        <TouchableOpacity
          disabled={isReaction}
          style={styles.likeContainer}
          onPress={() =>
            comment?.reaction === 'Like'
              ? handleCommentLikeDislike(comment?.id, 'Dislike')
              : handleCommentLikeDislike(comment?.id, 'Like')
          }>
          <Heart
            name={
              comment?.reaction === 'Like'
                ? 'cards-heart'
                : 'cards-heart-outline'
            }
            color={comment?.reaction === 'Like' ? 'red' : 'black'}
            size={17}
          />
          <Text style={styles.likesCount}>{comment?.likes || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Reply item component
const ReplyItem = ({
  reply,
  currentUser,
  isReaction,
  handleCommentLikeDislike,
  replyOnComment,
  handleLongPressStart,
  handleLongPressEnd,
  handleNavigate,
  timeAgo,
  menuVisible,
  menuCommentId,
  parentId,
}) => {
  const {optimizeImageKitUrl} = Constant();
  return (
    <TouchableWithoutFeedback
      key={reply?.id}
      onLongPress={e =>
        currentUser?.id === reply?.userId &&
        handleLongPressStart(e, reply?.id, reply?.comment, parentId)
      }
      onPressOut={handleLongPressEnd}
      delayLongPress={500}>
      <View
        style={[
          styles.replyItem,
          menuVisible && menuCommentId !== reply?.id && styles.blurredItem,
        ]}>
        <View style={styles.commentContentContainer}>
          {/* Profile Image */}
          <TouchableOpacity
            onPress={() => handleNavigate(reply?.user)}
            style={styles.replyProfileImageContainer}>
            <FastImage
              source={
                reply?.user?.profileImage
                  ? {
                      uri: optimizeImageKitUrl(
                        reply?.user?.profileImage,
                        200,
                        200,
                      ),
                    }
                  : require('../../../public/images/dpPlaceholder.png')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Username & Comment */}
          <View style={styles.commentTextContainer}>
            <TouchableOpacity
              style={{alignSelf: 'flex-start'}}
              onPress={() => handleNavigate(reply?.user)}>
              <Text style={styles.usernameText}>
                {reply?.user?.username || reply?.user?.firstname}{' '}
                <Text style={styles.timeAgoText}>
                  {timeAgo(reply?.createdAt)}
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.commentContent}>
              <CommentTextContent text={reply?.comment} />
            </View>

            <TouchableOpacity
              onPress={() =>
                replyOnComment(reply?.user?.username, reply?.replyTo)
              }
              style={styles.replyButton}>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Like Icon */}
        <TouchableOpacity
          disabled={isReaction}
          style={styles.likeContainer}
          onPress={() =>
            reply?.reaction === 'Like'
              ? handleCommentLikeDislike(reply?.id, 'Dislike', reply?.replyTo)
              : handleCommentLikeDislike(reply?.id, 'Like', reply?.replyTo)
          }>
          <Heart
            name={
              reply?.reaction === 'Like' ? 'cards-heart' : 'cards-heart-outline'
            }
            color={reply?.reaction === 'Like' ? 'red' : 'black'}
            size={15}
          />
          <Text style={styles.likesCount}>{reply?.likes || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Empty state component
const EmptyCommentState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No comments yet</Text>
    <Text style={styles.emptySubtitle}>Start the conversation.</Text>
  </View>
);

// Reply indicator component
const ReplyingIndicator = ({replyUsername, cancelReply}) => (
  <View style={styles.replyingContainer}>
    <Text style={styles.replyingText}>Replying to {replyUsername}</Text>
    <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
      <Text style={styles.cancelReplyText}>×</Text>
    </TouchableOpacity>
  </View>
);

// Header component
const CommentHeader = ({onClose, setCommentField}) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => {
        setCommentField('');
        onClose();
      }}
      style={styles.backButton}>
      {/* <CustomImage
        src="/images/mobtrekscape/back.svg"
        alt="Back"
        style={styles.backIcon}
      /> */}
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Comments</Text>
    <View style={styles.placeholderRight} />
  </View>
);

// Main CommentList component
const CommentList = ({
  postComment,
  replyOnComment,
  replyUsername,
  cancelReply,
  setPostComment,
  isLoading,
  commentlistRef,
  onClose,
  setCommentField,
  setEdit,
  edit,
  setTrackScapeFeeds,
  postId,
  fetchSinglefeed,
  editboxRef,
}) => {
  const navigation = useNavigation();
  const user = useSelector(state => state?.user);
  const [isReaction, setIsReaction] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    commentId: null,
    parentId: null,
    editText: '',
  });
  const longPressTimeout = useRef(null);
  const menuRef = useRef(null);

  // Handle long press for comment options
  const handleLongPressStart = (event, commentId, editText, parentId) => {
    if (event.nativeEvent.touches && event.nativeEvent.touches.length > 1)
      return;

    const {pageX, pageY} = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    const menuWidth = 200;
    const menuHeight = 80;

    let menuX = pageX;
    let menuY = pageY;

    if (menuX + menuWidth > screenWidth) {
      menuX = screenWidth - menuWidth - 10;
    }

    longPressTimeout.current = setTimeout(() => {
      setMenu({
        visible: true,
        x: menuX,
        y: menuY,
        commentId,
        parentId,
        editText,
      });
    }, 500);
  };

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimeout.current);
  };

  const handleCloseMenu = () => {
    setMenu({...menu, visible: false});
  };

  // Handle Delete comment
  const handleDelete = async () => {
    setIsDelete(true);
    try {
      const res = await deleteApiReq(`/check-ins/comments/${menu?.commentId}`);
      if (res?.status) {
        if (menu?.parentId) {
          setPostComment(prev =>
            prev.map(com =>
              com?.id === menu?.parentId
                ? {
                    ...com,
                    replies: com?.replies?.filter(
                      reply => reply?.id !== menu?.commentId,
                    ),
                  }
                : com,
            ),
          );
        } else {
          setPostComment(prev =>
            prev?.filter(com => com?.id !== menu?.commentId),
          );
        }
        handleCloseMenu();

        const singlePost = postComment.filter(
          post => post?.id === menu?.commentId,
        );

        const totalCount = singlePost[0]?.replies?.length || 0;

        setTrackScapeFeeds?.(prev => {
          return prev.map(comment => {
            if (comment.id === postId) {
              return {
                ...comment,
                _count: {
                  ...comment._count,
                  comments: comment._count.comments - (totalCount + 1),
                },
              };
            }
            return comment;
          });
        });
        fetchSinglefeed?.();
      } else {
        console.log('failed to delete comment', res?.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDelete(false);
    }
  };

  // Handle Edit comment
  const handleEdit = () => {
    setEdit({
      ...edit,
      text: menu?.editText,
      id: menu?.commentId,
      parentId: menu?.parentId ? menu?.parentId : null,
    });
    setMenu({...menu, visible: false});
  };

  // Handle like/dislike for comments
  const handleCommentLikeDislike = async (commentId, type, parentId) => {
    setIsReaction(true);
    try {
      const res = await postAuthReq(
        `/check-ins/comments/${commentId}/reactions`,
        {type},
      );

      if (res?.status) {
        setPostComment(prevComments =>
          prevComments.map(comment => {
            if (comment.id !== (parentId || commentId)) return comment;

            const likeChange = type === 'Like' ? 1 : -1;
            if (parentId) {
              return {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        reaction: type,
                        likes: (reply.likes || 0) + likeChange,
                      }
                    : reply,
                ),
              };
            } else {
              return {
                ...comment,
                reaction: type,
                likes: (comment.likes || 0) + likeChange,
              };
            }
          }),
        );
      }
    } catch (error) {
      console.error('Error handling like/dislike:', error);
    } finally {
      setIsReaction(false);
    }
  };

  // Format timestamp to relative time
  const timeAgo = timestamp => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const intervals = [
      {label: 'y', seconds: 31536000}, // 1 year = 31536000 seconds
      {label: 'mo', seconds: 2592000}, // 1 month = 2592000 seconds
      {label: 'w', seconds: 604800}, // 1 week = 604800 seconds
      {label: 'd', seconds: 86400}, // 1 day = 86400 seconds
      {label: 'h', seconds: 3600}, // 1 hour = 3600 seconds
      {label: 'm', seconds: 60}, // 1 minute = 60 seconds
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count}${interval.label}`;
      }
    }
    return 'Just now';
  };

  // Navigate to user profile
  const handleNavigate = userDetails => {
    // React Native navigation
    onClose();

    const path = {
      userType: userDetails?.type || user?.type,
      id: userDetails?.id || user?.id,
    };

    navigation.navigate('Profile', {path});
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CommentHeader onClose={onClose} setCommentField={setCommentField} />

      {/* Comments List or Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e93c00" />
        </View>
      ) : (
        <>
          <ScrollView
            ref={commentlistRef}
            style={[
              styles.commentsList,
              edit?.id ? styles.commentListWithEdit : null,
            ]}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            overScrollMode="never"
            contentContainerStyle={{paddingBottom: 80}}>
            {postComment?.length > 0 ? (
              postComment.map(comment => (
                <View key={comment?.id} style={styles.commentContainer}>
                  {/* Main comment */}
                  <CommentItem
                    comment={comment}
                    currentUser={user}
                    isReaction={isReaction}
                    handleCommentLikeDislike={handleCommentLikeDislike}
                    replyOnComment={replyOnComment}
                    handleLongPressStart={handleLongPressStart}
                    handleLongPressEnd={handleLongPressEnd}
                    handleNavigate={handleNavigate}
                    timeAgo={timeAgo}
                    menuVisible={menu.visible}
                    menuCommentId={menu.commentId}
                  />

                  {/* Reply comments */}
                  {comment?.replies &&
                    comment.replies.map(reply => (
                      <ReplyItem
                        key={reply?.id}
                        reply={reply}
                        currentUser={user}
                        isReaction={isReaction}
                        handleCommentLikeDislike={handleCommentLikeDislike}
                        replyOnComment={replyOnComment}
                        handleLongPressStart={handleLongPressStart}
                        handleLongPressEnd={handleLongPressEnd}
                        handleNavigate={handleNavigate}
                        timeAgo={timeAgo}
                        menuVisible={menu.visible}
                        menuCommentId={menu.commentId}
                        parentId={comment?.id}
                      />
                    ))}
                </View>
              ))
            ) : (
              <EmptyCommentState />
            )}
          </ScrollView>

          {/* Comment Options Dialog */}
          {menu.visible && (
            <CommentOptionsDialog
              menuRef={menuRef}
              menu={menu}
              handleDelete={handleDelete}
              isDelete={isDelete}
              handleEdit={handleEdit}
              onClose={handleCloseMenu}
            />
          )}

          {/* Replying indicator */}
          {replyUsername && (
            <ReplyingIndicator
              ref={editboxRef}
              replyUsername={replyUsername}
              cancelReply={cancelReply}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'white',
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 50,
    position: 'absolute',
    width: '100%',
  },
  backButton: {
    paddingLeft: 24,
    zIndex: 50,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  placeholderRight: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 25,
  },
  commentListWithEdit: {
    paddingBottom: 68,
  },
  commentContainer: {
    flexDirection: 'column',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  blurredItem: {
    opacity: 0.5,
  },
  commentContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileImageContainer: {
    width: 30,
    height: 30,
    marginTop: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  commentTextContainer: {
    flexDirection: 'column',
    width: '85%',
  },
  usernameText: {
    fontWeight: 'normal',
    fontSize: 12,
  },
  timeAgoText: {
    fontWeight: '300',
  },
  commentContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  commentText: {
    fontWeight: '500',
    color: 'black',
    lineHeight: 18,
  },
  mentionText: {
    fontWeight: '500',
    color: '#2563eb', // blue-600
  },
  replyButton: {
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  replyText: {
    fontSize: 12,
    color: '#6b7280', // gray-500
  },
  likeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingRight: 5,
    paddingLeft: 2,
  },
  likedIcon: {
    width: 16,
    height: 16,
    color: '#dc2626', // red-600
  },
  unlikedIcon: {
    width: 16,
    height: 16,
    color: '#6b7280', // gray-500
  },
  likesCount: {
    fontSize: 12,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 42,
    marginTop: 5,
  },
  replyProfileImageContainer: {
    width: 25,
    height: 25,
    marginTop: 5,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: Dimensions.get('window').height - 200,
  },
  emptyTitle: {
    color: 'black',
    fontSize: 20,
  },
  emptySubtitle: {
    color: '#4b5563', // gray-600
    fontSize: 14,
  },
  replyingContainer: {
    backgroundColor: '#cbd5e1', // slate-300
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  replyingText: {
    color: '#334155', // slate-700
    fontSize: 14,
  },
  cancelReplyButton: {},
  cancelReplyText: {
    color: 'black',
    fontSize: 20,
  },
});

export default CommentList;
