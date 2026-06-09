'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cnFormat } from '@/lib/utils';
import { Pencil, Shield, User } from 'lucide-react';

const USERS = [
  { id: '1', name: 'Carlos Mendoza', email: 'carlos@email.com', role: 'ADMIN', status: 'ACTIVE', joined: '2024-01-15' },
  { id: '2', name: 'María López', email: 'maria@email.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-03-22' },
  { id: '3', name: 'Juan Pérez', email: 'juan@email.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-04-10' },
  { id: '4', name: 'Ana García', email: 'ana@email.com', role: 'CUSTOMER', status: 'INACTIVE', joined: '2024-02-05' },
  { id: '5', name: 'Pedro González', email: 'pedro@email.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-05-18' },
  { id: '6', name: 'Lucía Ramírez', email: 'lucia@email.com', role: 'ADMIN', status: 'ACTIVE', joined: '2024-01-01' },
  { id: '7', name: 'Sofía Torres', email: 'sofia@email.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-06-30' },
];

const roleBadge = (role: string) => {
  if (role === 'ADMIN') {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        ADMIN
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <User className="h-3 w-3" />
      CUSTOMER
    </Badge>
  );
};

const statusBadge = (status: string) => {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
      {status}
    </Badge>
  );
};

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Registro</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">{statusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(user.joined)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
