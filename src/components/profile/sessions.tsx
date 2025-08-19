
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button"
import { Laptop, Smartphone } from "lucide-react"

const sessions = [
  {
    device: "Chrome di Windows",
    location: "Gresik, ID",
    ip: "103.24.12.10",
    isCurrent: true,
    icon: Laptop
  },
  {
    device: "Aplikasi Mobile Adelia",
    location: "Surabaya, ID",
    ip: "121.55.44.20",
    isCurrent: false,
    icon: Smartphone
  },
]

export function Sessions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesi Aktif</CardTitle>
        <CardDescription>
          Kelola dan keluar dari sesi aktif Anda di perangkat lain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-md border">
            <div className="flex items-center gap-4">
                <session.icon className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location} ({session.ip})</p>
                </div>
            </div>
            {session.isCurrent ? (
                <span className="text-sm font-semibold text-primary">Sesi ini</span>
            ) : (
                <Button variant="outline" size="sm">Keluar</Button>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="destructive">Keluar dari semua sesi</Button>
      </CardFooter>
    </Card>
  )
}
