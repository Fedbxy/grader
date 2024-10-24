import { VerdictStyleSwitcher } from "./verdict-switcher";
import { ThemeSwitcher } from "./theme-switcher";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export async function AppearanceCard() {
  const settings = [
    {
      key: "Theme",
      value: <ThemeSwitcher />,
    },
    {
      key: "Verdict Style",
      value: <VerdictStyleSwitcher />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Appearance</CardTitle>
        <CardDescription>Customize your appearance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableBody>
            {settings.map((setting, i) => (
              <TableRow key={i}>
                <TableCell className="font-semibold">{setting.key}</TableCell>
                <TableCell className="text-right">{setting.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}