
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Wand2, Users, CalendarIcon, CalendarDays } from "lucide-react";
import type { ItineraryGenerationInput, CrowdType } from "@/lib/types";
import React from "react";

const crowdTypes: { value: CrowdType; label: string }[] = [
  { value: "solo", label: "Solo Traveler" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family (with kids)" },
  { value: "friends", label: "Group of Friends" },
  { value: "business", label: "Business Trip" },
];

const formSchema = z.object({
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  preferences: z.string().min(5, {
    message: "Preferences must be at least 5 characters.",
  }),
  crowdType: z.enum(["solo", "couple", "family", "friends", "business"], {
    required_error: "Please select a crowd type.",
  }),
  isDayTrip: z.boolean().default(false),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date().optional(),
})
.refine(data => {
  if (!data.isDayTrip && !data.endDate) {
    return false; // endDate is required if not a day trip
  }
  return true;
}, {
  message: "End date is required for multi-day trips.",
  path: ["endDate"],
})
.refine(data => {
  if (!data.isDayTrip && data.endDate && data.startDate && data.startDate > data.endDate) {
    return false; // endDate must be after startDate
  }
  return true;
}, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  onSubmit: (values: ItineraryGenerationInput) => void;
  isLoading: boolean;
}

export function ItineraryForm({ onSubmit, isLoading }: ItineraryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      preferences: "",
      isDayTrip: false,
      crowdType: undefined,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const isDayTrip = form.watch("isDayTrip");

  React.useEffect(() => {
    if (isDayTrip) {
      form.setValue("endDate", undefined);
      form.clearErrors("endDate"); // Clear any previous errors for endDate
    }
  }, [isDayTrip, form]);

  function handleFormSubmit(values: FormValues) {
    const submissionValues: ItineraryGenerationInput = {
      ...values,
      crowdType: values.crowdType as CrowdType,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: values.isDayTrip || !values.endDate ? undefined : format(values.endDate, "yyyy-MM-dd"),
    };
    onSubmit(submissionValues);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Plan Your Next Trip</CardTitle>
        <CardDescription>Tell us where you want to go and what you love to do!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paris, France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crowdType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4" /> Who is traveling?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crowd type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crowdTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" /> Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" /> End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              isDayTrip && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={isDayTrip}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            (form.getValues("startDate") && date < form.getValues("startDate")) || isDayTrip
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isDayTrip"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:mt-[26px]"> {/* Align with labels roughly */}
                    <div className="space-y-0.5">
                      <FormLabel>Day Trip?</FormLabel>
                      <FormDescription className="text-xs">
                        Is this a single day adventure?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferences & Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Interested in museums, local cuisine, budget-friendly options, and walking tours."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? "Generating..." : "Generate Itinerary"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
