
import React from 'react';
import { User } from '@/types';
import SongModal from '@/components/SongModal';
import ProfileModal from '@/components/ProfileModal';
import UserProfileModal from '@/components/UserProfileModal';
import PinnedMessageManager from '@/components/PinnedMessageManager';
import PerksManagement from '@/components/PerksManagement';

interface ModalManagerProps {
  isSongModalOpen: boolean;
  isProfileModalOpen: boolean;
  isUserProfileModalOpen: boolean;
  isPinnedMessageModalOpen: boolean;
  isPerksModalOpen: boolean;
  selectedUser: User | null;
  pinnedMessage: string | null;
  closeSongModal: () => void;
  closeProfileModal: () => void;
  closeUserProfileModal: () => void;
  closePinnedMessageModal: () => void;
  closePerksModal: () => void;
  onPinnedMessageUpdated: (message: string | null) => void;
  onPerksUpdated: () => void;
  isAdmin: boolean;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  isSongModalOpen,
  isProfileModalOpen,
  isUserProfileModalOpen,
  isPinnedMessageModalOpen,
  isPerksModalOpen,
  selectedUser,
  pinnedMessage,
  closeSongModal,
  closeProfileModal,
  closeUserProfileModal,
  closePinnedMessageModal,
  closePerksModal,
  onPinnedMessageUpdated,
  onPerksUpdated,
  isAdmin
}) => {
  return (
    <>
      {isSongModalOpen && (
        <SongModal isOpen={isSongModalOpen} onClose={closeSongModal} />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
      )}
      
      {isUserProfileModalOpen && selectedUser && (
        <UserProfileModal 
          isOpen={isUserProfileModalOpen} 
          onClose={closeUserProfileModal} 
          user={selectedUser} 
        />
      )}
      
      {isPinnedMessageModalOpen && isAdmin && (
        <PinnedMessageManager
          isOpen={isPinnedMessageModalOpen}
          onClose={closePinnedMessageModal}
          currentPinnedMessage={pinnedMessage}
          onMessageUpdated={onPinnedMessageUpdated}
        />
      )}
      
      {isPerksModalOpen && (
        <PerksManagement
          isOpen={isPerksModalOpen}
          onClose={closePerksModal}
          onPerksUpdated={onPerksUpdated}
        />
      )}
    </>
  );
};

export default ModalManager;
