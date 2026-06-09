'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Inicia Sesión</h1>
        <p className="text-muted-foreground mb-8">Debes iniciar sesión para ver tu perfil.</p>
        <Button asChild size="lg">
          <Link href="/auth/login">
            <LogIn className="h-5 w-5 mr-2" />
            Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ name, lastName, phone });
      setMessage('Perfil actualizado correctamente.');
    } catch {
      setMessage('Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden.');
      return;
    }
    setSavingPassword(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordMessage('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMessage('Error al cambiar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mi Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {getInitials(user?.name ?? '', user?.lastName)}
                </span>
              )}
            </div>
            <div>
              <p className="text-lg">{user?.name} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Apellido</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user?.email ?? ''} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Teléfono</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 XX XXX XXXX" />
          </div>
          {message && (
            <p className={message.includes('Error') ? 'text-sm text-destructive' : 'text-sm text-green-600'}>
              {message}
            </p>
          )}
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña Actual</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          {passwordMessage && (
            <p className={passwordMessage.includes('Error') ? 'text-sm text-destructive' : 'text-sm text-green-600'}>
              {passwordMessage}
            </p>
          )}
          <Button onClick={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
