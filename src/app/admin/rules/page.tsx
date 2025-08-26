
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isAdmin() {
      return request.auth.token.role == 'Admin';
    }

    // Rules for user profiles
    match /users/{userId} {
      allow create: if isAdmin();
      allow read: if isAdmin() || request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if isAdmin();
      allow list: if isAdmin();
    }

    // Rules for daily financial reports
    match /dailyReports/{reportId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read, update: if isAdmin() || request.auth.uid == resource.data.userId;
      allow delete: if isAdmin();
      allow list: if isAdmin();
    }

    // Rules for general app settings
    match /app-settings/{setting} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
`;

export default function FirestoreRulesPage() {
  
  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRules.trim());
    toast({
      title: 'Aturan Disalin!',
      description: 'Aturan keamanan Firestore telah disalin ke clipboard.',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Aturan Keamanan Firestore</h2>
      </div>
      <p className="text-muted-foreground">
        Gunakan aturan ini untuk mengamankan database Firestore Anda. Salin dan tempelkan di Firebase Console.
      </p>
      
       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Penting</AlertTitle>
          <AlertDescription>
            Aturan ini harus diperbarui secara manual di Firebase Console pada tab <strong>Firestore Database {'>'} Rules</strong>. Aplikasi tidak dapat mengubahnya secara otomatis.
          </AlertDescription>
       </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Konten file firestore.rules</CardTitle>
          <CardDescription>
            Klik tombol di bawah untuk menyalin seluruh konten aturan keamanan.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Textarea
            readOnly
            value={firestoreRules.trim()}
            className="font-mono text-xs h-96"
          />
        </CardContent>
         <CardFooter>
            <Button onClick={handleCopyRules}>
              <Copy className="mr-2 h-4 w-4" />
              Salin Aturan
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
