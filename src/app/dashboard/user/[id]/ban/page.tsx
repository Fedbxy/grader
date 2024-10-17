import { validateRequest } from "@/lib/auth";
import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Path } from "@/components/path";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfirmButton } from "./confirmButton";
import { LocalTime } from "@/components/local-time";

export default async function Page({ params }: { params: { id: string } }) {
  await allowAccess("admin");

  if (isNaN(Number(params.id))) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) },
  });

  if (!user) {
    notFound();
  }

  const data = {
    ID: user.id,
    Username: user.username,
    "Display Name": user.displayName,
    Bio: user.bio || "",
    Role: user.role,
    Created: <LocalTime date={user.createdAt.toISOString()} />,
    Updated: <LocalTime date={user.updatedAt.toISOString()} />,
  };

  const { isBanned } = user;

  const { user: validateUser } = await validateRequest();

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-lg md:max-w-xl">
        <CardHeader>
          <CardTitle className="text-destructive">{isBanned ? "Unban" : "Ban"} User</CardTitle>
          <Path path={`/dashboard/user/${user.id}/ban`} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.avatar ? `/api/user/${user.id}/avatar` : ""}
                alt={user.username}
              />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <Table>
              <TableCaption className="text-left">
                This is read-only data.
              </TableCaption>
              <TableBody>
                {Object.entries(data).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="text-muted-foreground">
                      {key}
                    </TableCell>
                    <TableCell>
                      <pre>{value}</pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{isBanned ? "Unban" : "Ban"}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will <span className="font-bold">{isBanned ? "unban" : "ban"}</span> the user from the platform.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <ConfirmButton unban={isBanned} validateId={validateUser!.id} id={user.id} />
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
