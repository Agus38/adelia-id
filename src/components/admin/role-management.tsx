
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useRolesConfig, saveRolesConfig, type Role } from '@/lib/menu-store';
import { Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function RoleManagement() {
  const { roles: initialRoles, isLoading } = useRolesConfig();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);

  React.useEffect(() => {
    if (initialRoles) {
      setRoles(initialRoles);
    }
  }, [initialRoles]);

  const handleRoleNameChange = (id: string, newName: string) => {
    setRoles(roles.map(role => role.id === id ? { ...role, name: newName } : role));
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast({ title: 'Nama peran tidak boleh kosong', variant: 'destructive' });
      return;
    }
    const newId = newRoleName.trim().toLowerCase().replace(/\s+/g, '-');
    if (roles.some(r => r.id === newId)) {
        toast({ title: 'Peran sudah ada', description: 'Peran dengan nama tersebut sudah ada.', variant: 'destructive' });
        return;
    }
    const newRole: Role = {
      id: newId,
      name: newRoleName.trim(),
    };
    setRoles([...roles, newRole]);
    setNewRoleName('');
  };

  const handleDeleteClick = (role: Role) => {
    if (role.id === 'admin' || role.id === 'pengguna') {
        toast({ title: 'Tidak Diizinkan', description: 'Peran Admin dan Pengguna tidak dapat dihapus.', variant: 'destructive' });
        return;
    }
    setRoleToDelete(role);
  };
  
  const confirmDelete = () => {
    if (!roleToDelete) return;
    setRoles(roles.filter(role => role.id !== roleToDelete.id));
    setRoleToDelete(null);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await saveRolesConfig(roles);
      toast({ title: 'Peran Disimpan', description: 'Daftar peran telah berhasil diperbarui.' });
    } catch (error) {
      toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan peran.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peran Pengguna</CardTitle>
          <CardDescription>Kelola peran yang tersedia untuk pengguna.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peran Pengguna</CardTitle>
          <CardDescription>Kelola peran yang tersedia untuk pengguna di seluruh aplikasi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.id} className="flex items-center gap-2">
                <Input
                  value={role.name}
                  onChange={(e) => handleRoleNameChange(role.id, e.target.value)}
                  disabled={role.id === 'admin' || role.id === 'pengguna'}
                />
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(role)} disabled={role.id === 'admin' || role.id === 'pengguna'}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-4 border-t">
             <Input
                placeholder="Nama peran baru..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
            />
            <Button onClick={handleAddRole}>
                <PlusCircle className="mr-2 h-4 w-4"/> Tambah
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4"/>
            Simpan Perubahan Peran
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Hapus Peran "{roleToDelete?.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Pengguna dengan peran ini tidak akan terpengaruh, tetapi Anda perlu menetapkan peran baru untuk mereka.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
