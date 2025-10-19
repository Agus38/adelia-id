
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const firestoreRules = `rules_version = "2";

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isDbAdmin(uid) {
      return get(/databases/{database}/documents/users/{uid}).data.role == "Admin";
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && isDbAdmin(request.auth.uid);
      allow list: if request.auth != null && isDbAdmin(request.auth.uid);
      allow create: if request.auth.uid == userId
                    && request.resource.data.uid == userId
                    && request.resource.data.role == "Pengguna"
                    && request.resource.data.status == "Aktif";
      allow read: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId
                    && (!("role" in request.resource.data) || request.resource.data.role == resource.data.role)
                    && (!("status" in request.resource.data) || request.resource.data.status == resource.data.status);
    }
    
    match /userGroups/{groupId} {
        allow read, list: if request.auth != null;
        allow write: if request.auth != null;
        allow create, delete: if request.auth != null && isDbAdmin(request.auth.uid);
    }

    match /dailyReports/{reportId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);
      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);
    }

    match /stockReports/{reportId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);
      allow update: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);
      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);
    }
    
    match /budgetflow/{userId}/{document=**} {
      allow read: if (request.auth != null && isDbAdmin(request.auth.uid)) || request.auth.uid == userId;
      allow write, delete, create: if request.auth.uid == userId;
    }

    match /smwManyarReports/{reportId} {
      allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);
      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);
    }

    match /activityLogs/{logId} {
      allow read, write, create, update, delete, list: if request.auth != null && isDbAdmin(request.auth.uid);
    }
    
    match /ageCalculations/{calculationId} {
      allow create: if true;
      allow read, list, delete: if request.auth != null && isDbAdmin(request.auth.uid);
    }

    match /products/{productId} {
      allow read: if true;
      allow list: if true;
      allow write: if request.auth != null && isDbAdmin(request.auth.uid);
    }

    match /app-settings/{setting} {
      allow read: if true;
      allow write: if request.auth != null && isDbAdmin(request.auth.uid);
    }
  }
}`;

export default function FirestoreRulesPage() {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    setLastUpdated(`${formattedDate}, ${formattedTime} WIB`);
  }, []);
  
  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRules.trim());
    toast({
      title: 'Aturan Disalin!',
      description: 'Aturan keamanan Firestore telah disalin ke clipboard.',
    });
  };

  const characterCount = firestoreRules.trim().length;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Aturan Keamanan Firestore</h2>
      </div>
      <p className="text-muted-foreground">
        Gunakan aturan ini untuk mengamankan database Firestore Anda. Salin dan tempelkan di Firebase Console.
      </p>
      
       <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>PERINGATAN KEAMANAN: Aturan Diperbarui!</AlertTitle>
          <AlertDescription>
            Aturan keamanan telah diperbarui untuk memperbaiki error "permission denied" saat registrasi. Anda <strong>WAJIB</strong> menyalin aturan di bawah ini dan menempelkannya di Firebase Console pada tab <strong>Firestore Database {'>'} Rules</strong> untuk memastikan fungsionalitas registrasi berjalan lancar.
          </AlertDescription>
       </Alert>
       
       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Logika Verifikasi Admin Berubah!</AlertTitle>
          <AlertDescription>
            Fungsi helper `isDbAdmin` sekarang menerima `uid` sebagai argumen untuk verifikasi yang lebih aman di berbagai konteks aturan.
          </AlertDescription>
       </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Konten file firestore.rules</CardTitle>
          <CardDescription>
            Klik tombol di bawah untuk menyalin seluruh konten aturan. Total karakter: <strong>{characterCount}</strong>.
            <br />
            {lastUpdated ? `Terakhir diperbarui (real-time): ${lastUpdated}` : ''}
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
