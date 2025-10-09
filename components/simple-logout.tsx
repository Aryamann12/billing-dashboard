'use client';

import React, { useState } from 'react';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { useLogout, useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import ChangePasswordDialog from './change-password-dialog';

export default function SimpleLogout() {
  const { user } = useAuth();
  const handleLogout = useLogout();
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <>
      <div className="relative">
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full hover:bg-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>

        {isOpen && (
          <div 
            className="absolute right-0 top-12 w-56 bg-background border border-border rounded-md shadow-lg z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setShowChangePasswordDialog(true);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </button>
              
              <div className="border-t border-border my-1"></div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <ChangePasswordDialog 
        isOpen={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
      />
    </>
  );
}
