
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { menuItems as initialMenuItems } from '@/lib/menu-items-v2';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { MenuItem } from '@/lib/menu-items-v2';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


export function MenuManagement() {
  const [menuState, setMenuState] = useState<MenuItem[]>(initialMenuItems);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const handleEdit = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setEditDialogOpen(true);
  };
  
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newMenuState = [...menuState];
    const item = newMenuState[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newMenuState.length) {
      return;
    }

    newMenuState.splice(index, 1);
    newMenuState.splice(swapIndex, 0, item);

    setMenuState(newMenuState);
  };
  
  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save the new order.
    toast({
        title: "Perubahan Disimpan!",
        description: "Urutan menu telah berhasil diperbarui."
    })
  }

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Button onClick={handleSaveChanges}>Simpan Urutan Menu</Button>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ikon</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Visibilitas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuState.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <item.icon className="h-5 w-5" />
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Switch defaultChecked={!item.comingSoon} aria-label="Visibilitas menu" />
                </TableCell>
                <TableCell className="text-right space-x-1">
                   <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === menuState.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item: {selectedMenuItem?.title}</DialogTitle>
            <DialogDescription>
              Ubah detail item menu di bawah ini. Perubahan ikon memerlukan intervensi kode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">Label</Label>
              <Input id="label" defaultValue={selectedMenuItem?.title || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="path" className="text-right">Path</Label>
              <Input id="path" defaultValue={selectedMenuItem?.href || ''} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setEditDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
