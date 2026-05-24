'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface LogoutConfirmDialogProps {
  onConfirm: () => Promise<void> | void;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  buttonClassName?: string;
}

export function LogoutConfirmDialog({
  onConfirm,
  buttonLabel = 'Logout',
  buttonVariant = 'secondary',
  buttonClassName,
}: LogoutConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={buttonVariant}
          className={buttonClassName}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm logout</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to end your current session. This will remove your
            token from the browser and log you out of the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging out…' : 'Yes, log out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
