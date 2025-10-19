
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const firestoreRules = 'rules_version = "2";\n' +
  '\n' +
  'service cloud.firestore {\n' +
  '  match /databases/{database}/documents {\n' +
  '  \n' +
  '    function isDbAdmin(uid) {\n' +
  '      return get(/databases/{database}/documents/users/' + "$(uid)" + ').data.role == "Admin";\n' +
  '    }\n' +
  '\n' +
  '    match /users/{userId} {\n' +
  '      allow read, write: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '      allow list: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '      allow create: if request.auth != null && request.auth.uid == userId\n' +
  '                    && request.resource.data.uid == userId\n' +
  '                    && request.resource.data.role == "Pengguna"\n' +
  '                    && request.resource.data.status == "Aktif";\n' +
  '      allow read: if request.auth.uid == userId;\n' +
  '      allow update: if request.auth.uid == userId\n' +
  '                    && (!("role" in request.resource.data) || request.resource.data.role == resource.data.role)\n' +
  '                    && (!("status" in request.resource.data) || request.resource.data.status == resource.data.status);\n' +
  '    }\n' +
  '    \n' +
  '    match /userGroups/{groupId} {\n' +
  '        allow read, list: if request.auth != null;\n' +
  '        allow write: if request.auth != null;\n' +
  '        allow create, delete: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '\n' +
  '    match /dailyReports/{reportId} {\n' +
  '      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;\n' +
  '      allow read: if request.auth != null && (isDbAdmin(request.auth.uid) || reportId.split("-")[0] == request.auth.uid);\n' +
  '      allow update: if request.auth != null && (isDbAdmin(request.auth.uid) || resource.data.userId == request.auth.uid);\n' +
  '      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '\n' +
  '    match /stockReports/{reportId} {\n' +
  '      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;\n' +
  '      allow read: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);\n' +
  '      allow update: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);\n' +
  '      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '    \n' +
  '    match /budgetflow/{userId}/{document=**} {\n' +
  '      allow read, write, delete, create: if request.auth != null && (isDbAdmin(request.auth.uid) || request.auth.uid == userId);\n' +
  '    }\n' +
  '\n' +
  '    match /smwManyarReports/{reportId} {\n' +
  '      allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;\n' +
  '      allow read: if (request.auth != null && isDbAdmin(request.auth.uid)) || (request.auth != null && resource.data.userId == request.auth.uid);\n' +
  '      allow delete, list: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '\n' +
  '    match /activityLogs/{logId} {\n' +
  '      allow read, write, create, update, delete, list: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '    \n' +
  '    match /ageCalculations/{calculationId} {\n' +
  '      allow create: if true;\n' +
  '      allow read, list, delete: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '\n' +
  '    match /products/{productId} {\n' +
  '      allow read: if true;\n' +
  '      allow list: if true;\n' +
  '      allow write: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '\n' +
  '    match /app-settings/{setting} {\n' +
  '      allow read: if true;\n' +
  '      allow write: if request.auth != null && isDbAdmin(request.auth.uid);\n' +
  '    }\n' +
  '  }\n' +
  '}';

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
