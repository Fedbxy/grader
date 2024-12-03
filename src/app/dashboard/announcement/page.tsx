import { Editor } from "./editor";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Page() {
  return (
    <div>
      <h1>Announcement</h1>
      <div className="mx-auto w-full max-w-3xl">
        <Editor />
      </div>
      <div className="mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Save</Button>
            </TooltipTrigger>
            <TooltipContent>Save announcement</TooltipContent>
          </Tooltip>
      </div>
    </div>
  );
}
