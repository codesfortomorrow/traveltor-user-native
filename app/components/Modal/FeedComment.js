import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {getAuthReq, patchApiReq, postAuthReq} from '../../utils/apiHandlers';
import UserList from '../Comment/UserList';
import CommentList from '../Comment/CommentList';
import debounce from 'lodash/debounce';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FeedComment = ({
  onClose,
  isVisible,
  postId,
  feedUsername,
  setTrackScapeFeeds,
  fetchSinglefeed,
}) => {
  const [commentField, setCommentField] = useState('');
  const commentInputRef = useRef(null);
  const commentRef = useRef(null);
  const user = useSelector(state => state.user);
  const [postComment, setPostComment] = useState([]);
  const [replyUsername, setReplyUsername] = useState('');
  const [commentId, setCommentId] = useState('');
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const commentlistRef = useRef(null);
  const userlistref = useRef(null);
  const [isComment, setIsComment] = useState(false);
  const [edit, setEdit] = useState({
    text: null,
    id: null,
    parentId: null,
  });
  const commentboxRef = useRef(null);
  const editboxRef = useRef(null);

  const fetchComment = async (feedId, userId) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      ...(userId && {userId}),
    });
    const res = await getAuthReq(
      `/check-ins/comments/${feedId}?${params.toString()}`,
    );
    if (res?.status) {
      setPostComment(res?.data?.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      fetchComment(postId || global.sessionStorage.getItem('postId'), user?.id);
    }
  }, [postId, isVisible, user]);

  const putComment = async feedId => {
    setIsComment(true);
    const res = await postAuthReq(`/check-ins/comments/${feedId}`, {
      comment: commentField,
      ...(commentId && replyUsername && {replyTo: commentId}),
    });
    if (res?.status) {
      const feedPayload = {
        ...res?.data,
        replies: [],
        user: {username: user?.username, profileImage: user?.profileImage},
      };
      if (commentId) {
        setPostComment(prev =>
          prev.map(comment => {
            if (comment?.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), feedPayload],
              };
            }
            return comment;
          }),
        );
      } else {
        setPostComment(prev => [feedPayload, ...prev]);
      }

      setTrackScapeFeeds?.(prev => {
        return prev?.map(comment => {
          if (comment?.id === feedId) {
            return {
              ...comment,
              _count: {
                ...comment._count,
                comments: comment._count.comments + 1,
              },
            };
          }
          return comment;
        });
      });
      fetchSinglefeed?.();
      setCommentField('');
      cancelReply();
      setIsComment(false);
    } else {
      setIsComment(false);
    }
  };

  const replyOnComment = (username, commentId) => {
    setReplyUsername(username);
    setCommentId(commentId);
    setCommentField(`@${username} `);
  };

  const cancelReply = () => {
    if (edit?.id) {
      setEdit({
        text: null,
        id: null,
        parentId: null,
      });
    }
    setReplyUsername('');
    setCommentId('');
    setCommentField('');
  };

  const handleUserClick = selectedUsername => {
    const updatedComment = commentField.replace(
      /@\S*$/,
      `@${selectedUsername} `,
    );
    setCommentField(updatedComment);
    setUsername('');
    setUsers([]);

    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 0);
  };

  const handleInputChange = e => {
    const value = e.nativeEvent.text;
    setCommentField(value);

    const match = value.match(/(^|\s)@(\S*)$/);

    if (match) {
      const extractedUsername = match[2];

      if (extractedUsername.includes(' ')) {
        setUsername('');
        setUsers([]);
      } else {
        setUsername(extractedUsername);
        fetchUsersDebounced(extractedUsername);
      }
    } else {
      setUsername('');
      setUsers([]);
    }
  };

  const fetchUsers = async username => {
    setIsLoading(true);
    const params = new URLSearchParams({
      ...(username && {search: username}),
    });
    const res = await getAuthReq(`/users/search?${params.toString()}`);
    if (res?.status) {
      setUsers(res?.data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const fetchUsersDebounced = useCallback(
    debounce(username => fetchUsers(username), 500),
    [username],
  );

  useEffect(() => {
    if (isVisible && username) {
      fetchUsersDebounced(username);

      return () => fetchUsersDebounced.cancel();
    }
  }, [username]);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 300);
    }
  }, [isVisible, commentId]);

  const handleKeyDown = e => {
    if (e.nativeEvent.key !== 'Enter') return;

    if (users?.length === 1) {
      handleUserClick(users[0]?.username);
      return;
    }

    if (users?.length === 0) {
      edit?.id ? handleEdit() : putComment(postId);
    }
  };

  const prevPostCommentLength = useRef(postComment.length);

  useEffect(() => {
    if (postComment.length > prevPostCommentLength.current) {
      if (commentlistRef.current) {
        commentlistRef.current.scrollTo({y: 0, animated: true});
      }
    }

    prevPostCommentLength.current = postComment.length;
  }, [postComment]);

  useEffect(() => {
    if (edit?.text) {
      setCommentField(edit?.text);
      commentInputRef.current?.focus();
    }
  }, [edit]);

  const handleEdit = async () => {
    setIsComment(true);
    const res = await patchApiReq(`/check-ins/comments/${edit?.id}`, {
      comment: commentField,
    });
    if (res?.status) {
      if (edit?.parentId) {
        setPostComment(prev => {
          if (!prev) return prev;

          return prev?.map(com => {
            if (edit?.parentId && com?.id === edit?.parentId) {
              return {
                ...com,
                replies: com?.replies?.map(reply =>
                  reply?.id === edit?.id
                    ? {...reply, comment: commentField}
                    : reply,
                ),
              };
            } else {
              return com?.id === edit?.id
                ? {...com, comment: commentField}
                : com;
            }
          });
        });
      } else {
        setPostComment(prev => {
          if (!prev) return prev;
          return prev?.map(com =>
            com?.id === edit?.id ? {...com, comment: commentField} : com,
          );
        });
      }
      setCommentField('');
      setEdit({
        text: null,
        id: null,
        parentId: null,
      });
    } else {
      console.log('failed to update comment', res?.error);
    }
    setIsComment(false);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      style={styles.modal}
      swipeDirection={['down']}
      onSwipeComplete={onClose}
      propagateSwipe={true}>
      <View ref={commentRef} style={styles.container}>
        {commentField.match(/(^|\s)@(\S*)$/) && users.length > 0 ? (
          isLoading ? (
            <View style={styles.loaderContainer}>
              <View style={styles.loader}></View>
            </View>
          ) : (
            <UserList
              users={users}
              selectUser={handleUserClick}
              userlistref={userlistref}
            />
          )
        ) : (
          <CommentList
            postComment={postComment}
            replyOnComment={replyOnComment}
            replyUsername={replyUsername}
            cancelReply={cancelReply}
            setPostComment={setPostComment}
            isLoading={isLoading}
            commentlistRef={commentlistRef}
            onClose={onClose}
            setCommentField={setCommentField}
            setEdit={setEdit}
            edit={edit}
            setTrackScapeFeeds={setTrackScapeFeeds}
            fetchSinglefeed={fetchSinglefeed}
            postId={postId}
            editboxRef={editboxRef}
          />
        )}
        {/* Comment Input */}
        <View ref={commentboxRef} style={styles.commentBox}>
          <View style={styles.inputContainer}>
            {/* User Profile Image */}
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  user?.profileImage
                    ? {uri: user?.profileImage}
                    : require('../../../public/images/dpPlaceholder.png')
                }
                style={styles.profileImage}
              />
            </View>
            {/* Input Field */}
            <TextInput
              ref={commentInputRef}
              placeholder={`Add a comment for ${feedUsername || 'user'}`}
              value={commentField}
              onKeyPress={handleKeyDown}
              autoComplete="off"
              onChange={handleInputChange}
              style={styles.input}
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity
              disabled={isComment}
              onPress={edit?.id ? handleEdit : () => putComment(postId)}
              style={styles.sendButton}>
              {isComment ? (
                <View style={styles.sendingLoader}></View>
              ) : (
                <Icon name="send" size={24} color="#15803d" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* edit comment */}
        {edit?.id && (
          <View ref={editboxRef} style={styles.editBox}>
            <Text style={styles.editText}>
              Edit {edit?.text} to {commentField}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    // height: Dimensions.get('window').height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e93c00',
    borderTopColor: 'transparent',
    alignSelf: 'center',
  },
  commentBox: {
    backgroundColor: 'white',
    zIndex: 100,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    shadowOpacity: 0.1,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    flexShrink: 0,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingLoader: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#15803d',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  editBox: {
    backgroundColor: '#cbd5e1',
    position: 'absolute',
    bottom: 64,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editText: {
    color: '#334155',
    fontSize: 14,
  },
  closeButton: {
    color: 'black',
    fontSize: 20,
  },
});

export default FeedComment;
