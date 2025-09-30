'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // Helper function to check if the user is an Admin via Custom Claims.
    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // Rules for user profiles
    match /users/{userId} {
      // Admin can read and list any user profile.
      allow list, read: if isAdmin();
      
      // An authenticated user can read their own profile.
      allow read: if request.auth.uid == userId;
      
      // Admin can write to any user profile.
      allow write: if isAdmin();

      // A regular user can only update their own profile, but CANNOT change their role or status.
      // This rule only applies to UPDATES.
      allow update: if request.auth.uid == userId 
                            && request.resource.data.role == resource.data.role
                            && request.resource.data.status == resource.data.status;
                            
      // Allow a user document to be created as long as the creating user's UID
      // matches the document's UID. This prevents users from creating documents for others.
      allow create: if request.auth.uid == userId;
    }
    
    // Rules for user groups
    match /userGroups/{groupId} {
        // Only Admin can manage user groups
        allow read, write, delete, list: if isAdmin();
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
      allow read, list: if true;
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
