"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAnnouncementSchema } from "@/lib/zod/announcement";
import { Announcement } from "@/types/announcement";
import { editAnnouncement } from "@/actions/admin/announcement";
import { messages } from "@/config/messages";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AnnouncementEditor } from "@/components/announcement/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EditAnnouncementForm({ announcement }: { announcement: Announcement }) {
    const form = useForm<z.infer<typeof editAnnouncementSchema>>({
        resolver: zodResolver(editAnnouncementSchema),
        defaultValues: {
            title: announcement.title,
            content: announcement.content,
            visibility: announcement.visibility,
        },
    });

    async function onSubmit(values: z.infer<typeof editAnnouncementSchema>) {
        const data = new FormData();
        data.append("title", values.title);
        data.append("content", values.content);
        data.append("visibility", values.visibility);

        let updateData: any = {};

        if (values.title !== announcement.title) {
            updateData.title = values.title;
        }

        if (values.content !== announcement.content) {
            updateData.content = values.content;
        }

        if (values.visibility !== announcement.visibility) {
            updateData.visibility = values.visibility;
        }

        if (Object.keys(updateData).length === 0) {
            return toast.error(messages.form.noChanges);
        }

        const response = await editAnnouncement(announcement.id, data);

        if (response?.error) {
            return toast.error(response.error);
        }

        return toast.success("You have successfully edited the announcement.");
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <AnnouncementEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Editing..." : "Edit"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {form.formState.isSubmitting
                ? "Editing the announcement..."
                : "Edit the announcement"}
            </TooltipContent>
          </Tooltip>
        </form>
      </Form>
    );
}