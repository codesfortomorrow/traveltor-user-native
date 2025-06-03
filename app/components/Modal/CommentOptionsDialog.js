import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

const CommentOptionsDialog = ({
  menuRef,
  menu,
  handleDelete,
  isDelete,
  handleEdit,
  onClose,
}) => {
  return (
    <Modal
      transparent={true}
      visible={menu.visible}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              ref={menuRef}
              style={[
                styles.menu,
                {
                  left: menu.x,
                  top: menu.y,
                },
              ]}>
              {/* Edit Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEdit}
                disabled={isDelete}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Delete Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDelete}
                disabled={isDelete}>
                <Text style={[styles.menuText, styles.deleteText]}>
                  {isDelete ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteText: {
    color: '#dc2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
});

export default CommentOptionsDialog;
