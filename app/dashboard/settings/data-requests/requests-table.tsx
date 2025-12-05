'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, CheckCircle, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { approveDeletionRequestAction } from './actions';

interface RequestLog {
  _id: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  details?: {
    reason?: string;
    ticketId?: string;
  };
  userExists: boolean;
}

interface RequestsTableProps {
  requests: RequestLog[];
}

export function RequestsTable({ requests }: RequestsTableProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDelete = async (userId: string, logId: string) => {
    setProcessingId(userId);
    try {
      const result = await approveDeletionRequestAction(userId, logId);
      
      if (result.success) {
        toast({
          title: 'User Deleted',
          description: 'The user account has been permanently deleted.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests</CardTitle>
        <CardDescription>
          Review and process data deletion requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ticket ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending deletion requests
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {req.details?.ticketId || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{req.userEmail}</span>
                      <span className="text-xs text-muted-foreground">ID: {req.userId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={req.details?.reason}>
                    {req.details?.reason || 'No reason provided'}
                  </TableCell>
                  <TableCell>
                    {req.userExists ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Deleted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.userExists ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={!!processingId}
                          >
                            {processingId === req.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Delete Data
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account 
                              for <strong>{req.userEmail}</strong> and remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(req.userId, req._id)}
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                        <Button variant="ghost" size="sm" disabled>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Processed
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
