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
      
      // An authenticated user can create their own document.
      allow create: if request.auth.uid == userId;
      
      // An authenticated user can read their own profile.
      allow read: if request.auth.uid == userId;

      // An authenticated user can update their own profile,
      // but CANNOT change their role or status.
      allow update: if request.auth.uid == userId
                    && (!('role' in request.resource.data) || request.resource.data.role == resource.data.role)
                    && (!('status' in request.resource.data) || request.resource.data.status == resource.data.status);
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
