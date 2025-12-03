"use client";

import { useCallback, useState, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/app/actions";
import { toast } from "sonner";

type User = {
  id: string;
  full_name: string | null;
  role: "admin" | "barbero" | "cliente";
};

type Props = {
  initialUsers: User[];
  currentUserId: string;
};

const UserRow = memo(function UserRow({
  user,
  currentUserId,
  onRoleChange,
  isLoading,
}: {
  user: User;
  currentUserId: string;
  onRoleChange: (id: string, role: User["role"]) => void;
  isLoading: boolean;
}) {
  const isAdmin = user.role === "admin";
  const isBarber = user.role === "barbero";
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="p-3 border border-slate-700 rounded-lg flex justify-between items-center">
      <div>
        <p className="font-semibold flex items-center gap-2">
          {user.full_name || "Sin nombre"}

          {isCurrentUser && (
            <span className="px-2 py-0.5 text-xs rounded bg-emerald-600 text-white">
              Vos
            </span>
          )}
        </p>

        <p className="text-sm text-slate-400 capitalize">
          {user.role}
          {isCurrentUser && " (admin)"}
        </p>
      </div>

      <div className="flex gap-2">
        {/* Toggle Barbero */}
        <Button
          size="sm"
          className={isBarber ? "bg-red-600" : "bg-emerald-600"}
          disabled={isCurrentUser || isLoading}
          onClick={() =>
            onRoleChange(user.id, isBarber ? "cliente" : "barbero")
          }
        >
          {isLoading
            ? "Guardando..."
            : isBarber
            ? "Quitar Barbero"
            : "Hacer Barbero"}
        </Button>

        {/* Toggle Admin */}
        <Button
          size="sm"
          className={isAdmin ? "bg-red-600" : "bg-blue-600"}
          disabled={isCurrentUser || isLoading}
          onClick={() => onRoleChange(user.id, isAdmin ? "cliente" : "admin")}
        >
          {isLoading
            ? "Guardando..."
            : isAdmin
            ? "Quitar Admin"
            : "Hacer Admin"}
        </Button>
      </div>
    </div>
  );
});

export default function UsersAdminClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleRoleChange = useCallback(
    async (id: string, role: User["role"]) => {
      const user = users.find((u) => u.id === id);
      const oldRole = user?.role;

      setLoadingUserId(id);

      try {
        await updateUserRole(id, role);

        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role } : u))
        );

   
         toast.success("Rol actualizado", {
         description: `${
            user?.full_name || "El usuario"
          } ahora es ${role}.`,
      
        })
      } catch (err) {
        // revert UI en caso de que quieras mantener estado consistente
        if (oldRole) {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, role: oldRole } : u))
          );
        }
 toast.error("Error al actualizar el rol", {
           description: "Intenta de nuevo en unos segundos.",
          
        })
       
      } finally {
        setLoadingUserId(null);
      }
    },
    [toast, users]
  );

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-50">
      <CardHeader>
        <CardTitle className="text-xl">Últimos usuarios (10)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            currentUserId={currentUserId}
            onRoleChange={handleRoleChange}
            isLoading={loadingUserId === u.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}
