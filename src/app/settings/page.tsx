import { Metadata } from "next";
import { allowAccess } from "@/utils/access";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceCard } from "./appearance/card";
import { AccountCard } from "./account/card";
import { PasswordCard } from "./password/card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function Page() {
  await allowAccess("user");

  return (
    <div className="flex justify-center py-8">
      <Tabs defaultValue="appearance" className="w-full max-w-xs md:max-w-md">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceCard />
        </TabsContent>
        <TabsContent value="account">
          <AccountCard />
        </TabsContent>
        <TabsContent value="password">
          <PasswordCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
