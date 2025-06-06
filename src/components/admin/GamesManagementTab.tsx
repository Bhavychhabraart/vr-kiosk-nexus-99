import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import GameForm from "./GameForm";

interface GamesManagementTabProps {
  selectedVenueId?: string | null;
}

const GamesManagementTab = ({ selectedVenueId }: GamesManagementTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const { 
    games, 
    isLoading, 
    createGame, 
    updateGame, 
    deleteGame, 
    toggleGameStatus,
    isCreating,
    isUpdating,
    isDeleting
  } = useGames();
  
  // Filter games based on search term
  const filteredGames = games?.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleAddGame = (gameData: any) => {
    createGame(gameData);
    setIsAddGameOpen(false);
  };
  
  const handleEditGame = (gameData: any) => {
    updateGame(gameData);
    setIsEditGameOpen(false);
    setSelectedGame(null);
  };
  
  const handleDeleteGame = () => {
    if (selectedGame) {
      deleteGame(selectedGame.id);
      setIsDeleteDialogOpen(false);
      setSelectedGame(null);
    }
  };
  
  const openEditGameModal = (game: Game) => {
    setSelectedGame(game);
    setIsEditGameOpen(true);
  };
  
  const openDeleteConfirmation = (game: Game) => {
    setSelectedGame(game);
    setIsDeleteDialogOpen(true);
  };
  
  const handleToggleStatus = (game: Game) => {
    toggleGameStatus(game.id, !game.is_active);
  };
  
  return (
    <div className="vr-card">
      {selectedVenueId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Venue Filter Active:</strong> Showing games for selected venue
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Game Library</h2>
        <Button className="vr-button-secondary" onClick={() => setIsAddGameOpen(true)}>
          Add New Game
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vr-muted h-4 w-4" />
        <Input
          placeholder="Search games..."
          className="pl-10 bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-vr-secondary" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-vr-primary/20">
                <th className="py-3 px-4 text-left text-vr-muted font-medium">Game Title</th>
                <th className="py-3 px-4 text-left text-vr-muted font-medium">Description</th>
                <th className="py-3 px-4 text-left text-vr-muted font-medium">Status</th>
                <th className="py-3 px-4 text-right text-vr-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map(game => (
                <tr key={game.id} className="border-b border-vr-primary/10 hover:bg-vr-dark/50">
                  <td className="py-3 px-4 font-medium">{game.title}</td>
                  <td className="py-3 px-4 text-vr-muted">{game.description || "No description"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {game.is_active ? "Available" : "Maintenance"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-vr-muted hover:text-vr-text"
                      onClick={() => handleToggleStatus(game)}
                      title={game.is_active ? "Set to maintenance" : "Set to available"}
                    >
                      {game.is_active ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-vr-secondary hover:text-vr-secondary/80"
                      onClick={() => openEditGameModal(game)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-vr-accent hover:text-vr-accent/80"
                      onClick={() => openDeleteConfirmation(game)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredGames.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-vr-muted">
                    {searchTerm 
                      ? `No games found matching "${searchTerm}"`
                      : "No games available. Add some games to get started!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Add Game Form Modal */}
      <GameForm
        open={isAddGameOpen}
        onClose={() => setIsAddGameOpen(false)}
        onSubmit={handleAddGame}
        isSubmitting={isCreating}
      />
      
      {/* Edit Game Form Modal */}
      {selectedGame && (
        <GameForm
          open={isEditGameOpen}
          onClose={() => {
            setIsEditGameOpen(false);
            setSelectedGame(null);
          }}
          onSubmit={handleEditGame}
          isSubmitting={isUpdating}
          game={selectedGame}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-vr-dark border-vr-primary/30 text-vr-text">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium text-vr-text">
                {selectedGame?.title}
              </span>{' '}
              from your game library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGame}
              className="bg-vr-accent hover:bg-vr-accent/80"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GamesManagementTab;
