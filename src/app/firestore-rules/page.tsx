
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // Helper function to check if the user is an Admin by reading their user document.
    function isDbAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    // Rules for user profiles
    match /users/{userId} {
      // Admin can manage any user profile.
      allow read, write, list: if isDbAdmin();
      
      // An authenticated user can create their own document, but only with a 'Pengguna' role and 'Aktif' status.
      // This prevents a user from creating an Admin account for themselves.
      allow create: if request.auth.uid == userId
                    && request.resource.data.role == 'Pengguna'
                    && request.resource.data.status == 'Aktif';
      
      // An authenticated user can read their own profile.
      allow read: if request.auth.uid == userId;

      // An authenticated user can update their own profile,
      // but CANNOT change their role or status.
      allow update: if request.auth.uid == userId
                    && request.resource.data.role == resource.data.role
                    && request.resource.data.status == resource.data.status;
    }
    
    // Rules for user groups
    match /userGroups/{groupId} {
        // Authenticated users can read the list of groups (for access checks).
        allow list, read: if request.auth != null;
        // ONLY Admin can create, write, or delete user groups.
        allow create, write, delete: if isDbAdmin();
    }

    // Rules for daily financial reports
    match /dailyReports/{reportId} {
      // Allow authenticated users to create a report if the userId in the report data matches their own uid.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Allow users to read/update their own reports, and Admin to read/update any report.
      allow read, update: if isDbAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can delete or list all reports.
      allow delete, list: if isDbAdmin();
    }

    // Rules for stock reports
    match /stockReports/{reportId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Admin can read any report. Regular users can only read their own.
      allow read: if isDbAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      allow update: if isDbAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can list/delete reports
      allow delete, list: if isDbAdmin();
    }
    
    // Rules for BudgetFlow feature
    match /budgetflow/{userId}/{document=**} {
    	// Users can only access their own data within their folder.
      // This covers transactions, goals, debts, and categories sub-collections.
      allow read, write, delete, create: if request.auth.uid == userId;
    }

    // Rules for SMW Manyar reports
    match /smwManyarReports/{reportId} {
      // Allow users to create or update their own reports.
      allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Admin can read any report. Regular users can only read their own.
      allow read: if isDbAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can list/delete reports
      allow delete, list: if isDbAdmin();
    }

    // Rules for activity logs
    match /activityLogs/{logId} {
      // Allow any authenticated user to create a log entry.
      allow create: if request.auth != null;
      // Only Admin can read, update, or delete logs.
      allow read, update, delete, list: if isDbAdmin();
    }
    
    // Rules for age calculation logs
    match /ageCalculations/{calculationId} {
      // Allow anyone to create an entry (public feature)
      allow create: if true;
      // Only Admin can read or list entries
      allow read, list, delete: if isDbAdmin();
    }

    // Rules for digital products synced from Digiflazz
    match /products/{productId} {
      // Anyone can read the product list.
      allow read, list: if true;
      // ONLY Admin can write/update/delete products. This is secure.
      allow write: if isDbAdmin();
    }

    // Rules for general app settings
    match /app-settings/{setting} {
      // Anyone can read app settings (e.g., menu configuration).
      allow read: if true;
      // ONLY Admin can write/update app settings. This is secure.
      allow write: if isDbAdmin();
    }
  }
}
`;

export default function FirestoreRulesPage() {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This runs on the client-side, ensuring the date is current for the user.
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
          <AlertTitle>PERINGATAN KEAMANAN: Aturan Diperbarui!</AlertTitle>
          <AlertDescription>
            Aturan keamanan telah diperbarui secara signifikan untuk menutup celah keamanan pada proses pendaftaran pengguna. Anda <strong>WAJIB</strong> menyalin aturan di bawah ini dan menempelkannya di Firebase Console pada tab <strong>Firestore Database {'>'} Rules</strong> untuk memastikan keamanan aplikasi Anda.
          </AlertDescription>
       </Alert>
       
       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Logika Verifikasi Admin Berubah!</AlertTitle>
          <AlertDescription>
            Sistem verifikasi Admin sekarang menggunakan pembacaan langsung ke dokumen pengguna di Firestore, bukan lagi custom claims. Ini lebih andal dan mudah dikelola.
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
