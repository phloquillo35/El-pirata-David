'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import { Pencil, Shield, User, Search } from 'lucide-react';

const roleBadge = (role: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary'; icon: typeof Shield | typeof User }> = {
    ADMIN: { label: 'Administrador', variant: 'default', icon: Shield },
    SUPER_ADMIN: { label: 'Super Admin', variant: 'default', icon: Shield },
    CUSTOMER: { label: 'Cliente', variant: 'secondary', icon: User },
  };
  const entry = config[role] || { label: role, variant: 'secondary' as const, icon: User };
  const Icon = entry.icon;
  return (
    <Badge variant={entry.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {entry.label}
    </Badge>
  );
};

const statusBadge = (isActive: boolean) => {
  return (
    <Badge variant={isActive ? 'success' : 'destructive'}>
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', lastName: '', role: 'CUSTOMER' });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const params: any = { page: 1, limit: 100 };
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await api.get<{ data: any[] }>('/users', params);
        if (cancelled) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, retryKey]);

  const openEdit = (user: any) => {
    setExpandedId(expandedId === user.id ? null : user.id);
    setEditForm({
      name: user.name || '',
      lastName: user.lastName || '',
      role: user.role || 'CUSTOMER',
    });
  };

  const handleSave = async (userId: string) => {
    setIsSaving(true);
    try {
      await api.patch(`/users/${userId}`, {
        name: editForm.name || undefined,
        lastName: editForm.lastName || undefined,
        role: editForm.role,
      });
      showToast('Usuario actualizado');
      setExpandedId(null);
      setRetryKey(k => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      showToast('Estado cambiado');
      setRetryKey(k => k + 1);
    } catch (err) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      showToast(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground mb-4">{fetchError}</p>
              <Button variant="outline" onClick={() => setRetryKey(k => k + 1)}>Reintentar</Button>
            </div>
          ) : (
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
                  {users.map((user) => (
                    <Fragment key={user.id}>
                      <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                              {user.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-medium">
                              {user.name}{user.lastName ? ` ${user.lastName}` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">{roleBadge(user.role)}</td>
                        <td className="px-4 py-3">{statusBadge(user.isActive)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      {expandedId === user.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Nombre</label>
                                  <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Nombre"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Apellido</label>
                                  <Input
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                                    placeholder="Apellido"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Rol</label>
                                  <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  >
                                    <option value="CUSTOMER">Cliente</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(user.id)}
                                  disabled={isSaving}
                                >
                                  {isSaving ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.isActive ? 'destructive' : 'default'}
                                  onClick={() => handleToggleStatus(user.id)}
                                >
                                  {user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron usuarios{search ? ` para "${search}"` : ''}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
