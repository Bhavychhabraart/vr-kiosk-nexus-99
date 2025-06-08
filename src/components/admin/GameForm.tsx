
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { Loader2, Film } from "lucide-react";

// Define the form validation schema
const gameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  executable_path: z.string().optional(),
  working_directory: z.string().optional(),
  arguments: z.string().optional(),
  image_url: z.string().optional(),
  trailer_url: z.string().optional(),
  min_duration_seconds: z.coerce.number()
    .int()
    .min(1, "Minimum duration must be at least 1 second"),
  max_duration_seconds: z.coerce.number()
    .int()
    .min(1, "Maximum duration must be at least 1 second")
}).refine(data => data.max_duration_seconds > data.min_duration_seconds, {
  message: "Maximum duration must be greater than minimum duration",
  path: ["max_duration_seconds"]
});

type GameFormData = z.infer<typeof gameSchema>;

type GameFormProps = {
  game?: Game;
  onClose: () => void;
  venueId: string;
};

const GameForm = ({ game, onClose, venueId }: GameFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!game;
  
  const form = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: game?.title || "",
      description: game?.description || "",
      executable_path: game?.executable_path || "",
      working_directory: game?.working_directory || "",
      arguments: game?.arguments || "",
      image_url: game?.image_url || "",
      trailer_url: game?.trailer_url || "",
      min_duration_seconds: game?.min_duration_seconds || 300,
      max_duration_seconds: game?.max_duration_seconds || 1800
    }
  });

  // Create or update game
  const saveGame = useMutation({
    mutationFn: async (gameData: GameFormData) => {
      if (isEditing && game) {
        const { data, error } = await supabase
          .from('games')
          .update({
            title: gameData.title,
            description: gameData.description || null,
            executable_path: gameData.executable_path || null,
            working_directory: gameData.working_directory || null,
            arguments: gameData.arguments || null,
            image_url: gameData.image_url || null,
            trailer_url: gameData.trailer_url || null,
            min_duration_seconds: gameData.min_duration_seconds,
            max_duration_seconds: gameData.max_duration_seconds
          })
          .eq('id', game.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('games')
          .insert({
            title: gameData.title,
            description: gameData.description || null,
            executable_path: gameData.executable_path || null,
            working_directory: gameData.working_directory || null,
            arguments: gameData.arguments || null,
            image_url: gameData.image_url || null,
            trailer_url: gameData.trailer_url || null,
            min_duration_seconds: gameData.min_duration_seconds,
            max_duration_seconds: gameData.max_duration_seconds
          })
          .select()
          .single();
        if (error) throw error;

        // Assign the new game to this venue
        const { error: assignError } = await supabase
          .from('machine_games')
          .insert({
            venue_id: venueId,
            game_id: data.id,
            assigned_by: 'admin'
          });
        if (assignError) throw assignError;

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      toast({
        title: "Success",
        description: `Game ${isEditing ? 'updated' : 'created'} successfully`
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (values: GameFormData) => {
    saveGame.mutate(values);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-vr-dark border-vr-primary/30 text-vr-text max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? "Edit Game" : "Add New Game"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the game details below" 
              : "Fill in the details below to add a new game to the library"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Game title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Game description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/games/imagename.jpg" />
                    </FormControl>
                    <FormDescription>
                      Path to the game image (e.g., /games/beatsaber.jpg)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trailer_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Film className="h-4 w-4 mr-1 text-vr-secondary" />
                      <span>Trailer URL</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                    </FormControl>
                    <FormDescription>
                      YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_duration_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="300" 
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum session length in seconds (e.g., 300 = 5 minutes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_duration_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="1800" 
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum session length in seconds (e.g., 1800 = 30 minutes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="executable_path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Executable Path</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="C:\Games\Example\game.exe" />
                  </FormControl>
                  <FormDescription>
                    Full path to the game executable file
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="working_directory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Directory</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="C:\Games\Example\" />
                  </FormControl>
                  <FormDescription>
                    Working directory for the game executable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="arguments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Launch Arguments</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="--fullscreen --vr" />
                  </FormControl>
                  <FormDescription>
                    Optional command-line arguments for launching the game
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20"
                onClick={onClose}
                disabled={saveGame.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="vr-button" 
                disabled={saveGame.isPending}
              >
                {saveGame.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Game"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GameForm;
