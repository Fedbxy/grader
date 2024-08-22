import { validateRequest, allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
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
import { DeleteConfirmButton } from "./deleteConfirmButton";

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
    Created: user.createdAt.toLocaleString(),
    Updated: user.updatedAt.toLocaleString(),
  };

  const { user: validateUser } = await validateRequest();

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-lg md:max-w-xl">
        <CardHeader>
          <CardTitle className="text-destructive">Delete User</CardTitle>
          <Path path={`/dashboard/user/${user.id}/delete`} />
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
          <Button variant="outline" asChild>
            <Link
              href={
                typeof searchParams.back === "string"
                  ? searchParams.back
                  : "/dashboard/user"
              }
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this account and remove the data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <DeleteConfirmButton validateId={validateUser!.id} id={user.id} />
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
