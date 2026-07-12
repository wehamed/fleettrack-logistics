import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderScreen({
  icon: Icon,
  title,
  note,
}: {
  icon: LucideIcon;
  title: string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100 dark:bg-secondary-700">
          <Icon className="h-8 w-8 text-secondary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-200">
            {title}
          </h3>
          <p className="mt-1 max-w-md text-sm text-secondary-500 dark:text-secondary-400">
            {note}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
