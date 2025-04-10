import React from 'react';
import { User, PinnedMessage } from '@/types';
import SongModal from '@/components/SongModal';
import ProfileModal from '@/components/ProfileModal';
import PinnedMessageManager from '@/components/modals/PinnedMessageManager';
import PerksManagement from '@/components/PerksManagement';
import SongRequestManager from '@/components/SongRequestManager';

interface ModalManagerProps {
  isSongModalOpen: boolean;
  isProfileModalOpen: boolean;
  isUserProfileModalOpen: boolean;
  isPinnedMessageModalOpen: boolean;
  isPerksModalOpen: boolean;
  isSongRequestManagerOpen: boolean;
  selectedUser: User | null;
  pinnedMessage: string | null;
  closeSongModal: () => void;
  closeProfileModal: () => void;
  closeUserProfileModal: () => void;
  closePinnedMessageModal: () => void;
  closePerksModal: () => void;
  closeSongRequestManager: () => void;
  onPinnedMessageUpdated: (messages: PinnedMessage[] | null) => void;
  onPerksUpdated: () => void;
  isAdmin: boolean;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  isSongModalOpen,
  isProfileModalOpen,
  isUserProfileModalOpen,
  isPinnedMessageModalOpen,
  isPerksModalOpen,
  isSongRequestManagerOpen,
  selectedUser,
  pinnedMessage,
  closeSongModal,
  closeProfileModal,
  closeUserProfileModal,
  closePinnedMessageModal,
  closePerksModal,
  closeSongRequestManager,
  onPinnedMessageUpdated,
  onPerksUpdated,
  isAdmin
}) => {
  return (
    <>
      {isSongModalOpen && (
        <SongModal isOpen={isSongModalOpen} onClose={closeSongModal} />
      )}
      
      {(isProfileModalOpen || isUserProfileModalOpen) && (
        <ProfileModal 
          isOpen={isProfileModalOpen || isUserProfileModalOpen} 
          onClose={isProfileModalOpen ? closeProfileModal : closeUserProfileModal}
          user={isUserProfileModalOpen ? selectedUser : undefined}
        />
      )}
      
      {isPinnedMessageModalOpen && isAdmin && (
        <PinnedMessageManager
          isOpen={isPinnedMessageModalOpen}
          onClose={closePinnedMessageModal}
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

      {isSongRequestManagerOpen && isAdmin && (
        <SongRequestManager
          isOpen={isSongRequestManagerOpen}
          onClose={closeSongRequestManager}
        />
      )}
    </>
  );
};

export default ModalManager;
