
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // Helper function to check for Admin role
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
    }

    // Rules for user profiles
    match /users/{userId} {
      // Admin can read any profile and list all users.
      // A regular user can only read their own profile.
      allow read, list: if isAdmin() || request.auth.uid == userId;
      
      // Admin can create/update any user profile.
      // A regular user can only create/update their own profile.
      // An existing user cannot change their own role.
      allow write: if isAdmin() || (request.auth.uid == userId && request.resource.data.role == resource.data.role);

      // Only Admin can delete a user document.
      allow delete: if isAdmin();
    }

    // Rules for daily financial reports
    match /dailyReports/{reportId} {
      // Allow authenticated users to create a report if the userId in the report data matches their own uid.
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Allow users to read/update their own reports, and Admin to read/update any report.
      allow read, update: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can delete or list all reports.
      allow delete, list: if isAdmin();
    }

    // Rules for stock reports
    match /stockReports/{reportId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Admin can read any report. Regular users can only read their own.
      allow read: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      allow update: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can list/delete reports
      allow delete, list: if isAdmin();
    }

    // Rules for SMW Manyar reports
    match /smwManyarReports/{reportId} {
      // Allow users to create or update their own reports.
      allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Admin can read any report. Regular users can only read their own.
      allow read: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      // Only Admin can list/delete reports
      allow delete, list: if isAdmin();
    }

    // Rules for activity logs
    match /activityLogs/{logId} {
      // Allow any authenticated user to create a log entry.
      allow create: if request.auth != null;
      // Only Admin can read, update, or delete logs.
      allow read, update, delete, list: if isAdmin();
    }
    
    // Rules for age calculation logs
    match /ageCalculations/{calculationId} {
      // Allow anyone to create an entry (public feature)
      allow create: if true;
      // Only Admin can read or list entries
      allow read, list, delete: if isAdmin();
    }

    // Rules for digital products synced from Digiflazz
    match /products/{productId} {
      // Anyone can read the product list.
      allow read: if true;
      // ONLY Admin can write/update/delete products. This is secure.
      allow write: if isAdmin();
    }

    // Rules for general app settings
    match /app-settings/{setting} {
      // Anyone can read app settings (e.g., menu configuration).
      allow read: if true;
      // ONLY Admin can write/update app settings. This is secure.
      allow write: if isAdmin();
    }
  }
}
`;

export default function FirestoreRulesPage() {
  
  const { toast } = useToast();
  
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
