'use client';

import { User } from '@/app/dashboard/users/page';
import { AddUserModal } from './AddUserModal';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

/**
 * EditUserModal - Reuses AddUserModal for editing user data
 * This component is a wrapper that passes the user prop to AddUserModal
 * to enable edit mode
 */
export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  return <AddUserModal user={user} onClose={onClose} onSuccess={onSuccess} />;
}

